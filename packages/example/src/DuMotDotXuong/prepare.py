"""Separate this reference into illustrated plates, moving patches, captions, and audio."""

import argparse
from bisect import bisect_right
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image

WIDTH, HEIGHT, FPS, LENGTH = 1024, 576, 24, 19118
BAND = 484
# Source-frame boundaries; the separately editable cut lives in Film.tsx.
CUTS = (
    0, 260, 437, 656, 868, 1376, 1807, 1950, 2124, 2453, 2746, 2973,
    3071, 3160, 3257, 3421, 3532, 3803, 4215, 4824, 4839, 5333, 5758,
    6304, 6588, 6721, 6956, 7386, 7828, 8534, 9175, 9305, 9495, 9648,
    9736, 10092, 10377, 10551, 10713, 11040, 11520, 11831, 11998, 12224,
    12712, 13161, 13630, 14121, 14232, 14460, 14502, 15074, 15259, 15893,
    16339, 16676, 17086, 17512, 17787, 18060, 18682, LENGTH,
)
LEAF = {0, 4215, 9648, 9736, 10551, 10713, 11040, 11520, 17787, 18060}
FFMPEG = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-nostdin', '-y']
ENCODE = [
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast',
    '-crf', '13', '-threads', '2', '-g', '24', '-bf', '0',
    '-colorspace', 'bt470bg', '-movflags', '+faststart',
]


def grab(source, filters, pixels, shape):
    raw = subprocess.check_output(FFMPEG + [
        '-threads', '4', '-i', str(source), '-an', '-filter_threads', '2',
        '-vf', filters, '-fps_mode', 'passthrough', '-pix_fmt', pixels, '-f', 'rawvideo', '-',
    ])
    return np.frombuffer(raw, dtype=np.uint8).reshape((-1, *shape))


def select_frames(numbers):
    # A flat sum produces a deep expression tree in FFmpeg's evaluator.
    if len(numbers) == 1:
        return rf'eq(n\,{numbers[0]})'
    mid = len(numbers) // 2
    return '(' + select_frames(numbers[:mid]) + '+' + select_frames(numbers[mid:]) + ')'


def caption_boxes(frame):
    """The reference has one or two 33 px subtitle rows on the same baselines."""
    luma = frame[..., 1]
    boxes = []
    for y in (487, 520):
        ink = (luma[y + 4:y + 30] > 195).any(0)
        peaks = np.flatnonzero(ink[90:-90]) + 90
        if len(peaks) >= 20:
            boxes.append((int(peaks[0]) - 11, y, int(peaks[-1]) + 12, y + 34))
    if not boxes or boxes[-1][1] != 520:
        raise RuntimeError('Không nhận ra dải phụ đề trong bản mẫu.')
    left = min(box[0] for box in boxes)
    return [(left, y, right, bottom) for _, y, right, bottom in boxes]


def caption_mask(boxes):
    mask = np.zeros((HEIGHT - BAND, WIDTH), dtype=bool)
    for x, y, right, bottom in boxes:
        mask[y - BAND - 2:bottom - BAND + 3, x - 3:right + 3] = True
    return mask


def split_plate(frame, masks, bands, which, leaf_band):
    """Look under covered pixels using the nearest other cue in the same shot."""
    band = bands[which].copy()
    missing = masks[which].copy()
    for j in sorted(range(len(bands)), key=lambda j: abs(j - which)):
        use = missing & ~masks[j]
        band[use] = bands[j][use]
        missing &= masks[j]

    if leaf_band is not None:
        # The leaf illustration is symmetric about its central vein.
        band[missing] = leaf_band[missing]
    else:
        for x in np.flatnonzero(missing.any(0)):
            y = np.flatnonzero(missing[:, x])
            known = np.flatnonzero(~missing[:, x])
            for channel in range(3):
                band[y, x, channel] = np.interp(y, known, band[known, x, channel])

    result = frame.copy()
    result[BAND:] = band
    return result


def save_caption(frame, clean, boxes, path):
    x0 = min(box[0] for box in boxes)
    y0 = boxes[0][1]
    x1 = max(box[2] for box in boxes)
    y1 = boxes[-1][3]
    sprite = np.zeros((y1 - y0, x1 - x0, 4), dtype=np.uint8)
    for x, y, right, bottom in boxes:
        original = frame[y:bottom, x:right].astype(np.float32)
        backing = clean[y:bottom, x:right].astype(np.float32)
        # Choose an alpha that can represent every source channel over this plate.
        light = ((original - backing) / np.maximum(255 - backing, 1)).max(2)
        dark = ((backing - original) / np.maximum(backing, 1)).max(2)
        alpha = np.maximum(np.maximum(light, dark), .82)
        color = (original - backing * (1 - alpha[..., None])) / alpha[..., None]
        rgba = np.concatenate([color, 255 * alpha[..., None]], axis=2)
        sprite[y - y0:bottom - y0, x - x0:right - x0] = np.clip(rgba + .5, 0, 255)
    Image.fromarray(sprite).save(path, compress_level=3)
    return [x0, y0, x1 - x0, y1 - y0]


def motion_rect(preview, boxes):
    spread = preview.max(0).astype(np.int16) - preview.min(0)
    # Inspect real picture changes outside the caption area, not text changes.
    no_caps = ~np.logical_or.reduce([caption_mask(box) for box in boxes])
    outside = no_caps.reshape((23, 4, 256, 4)).all((1, 3))
    band_moves = np.count_nonzero((spread[BAND // 4:] > 7) & outside) > 75
    spread[BAND // 4:] = 0
    active = np.argwhere(spread > 8)
    if band_moves:
        return [0, max(0, int(active[:, 0].min()) * 4 - 8) if len(active) else BAND,
                WIDTH, HEIGHT]
    if not len(active):
        return None
    top, left = [max(0, int(i) * 4 - 8) for i in active.min(0)]
    bottom, right = [int(i) * 4 + 12 for i in active.max(0)]
    return [left, top, min(WIDTH, right), min(BAND, bottom)]


def make_patch(source, start, end, rect, spans, masks, clean_bands, path):
    x, y, right, bottom = rect
    w, h = right - x, bottom - y
    # Seek into the frame interval just before the requested frame, never after it.
    seek = FFMPEG + ['-threads', '2', '-ss', f'{max(0, start / FPS - .002):.6f}',
                     '-i', str(source), '-an', '-filter_threads', '1']
    crop = f'crop={w}:{h}:{x}:{y}'
    if bottom <= BAND:
        subprocess.run(seek + [
            '-vf', crop, '-frames:v', str(end - start), *ENCODE, str(path),
        ], check=True)
        return

    # In the few shots where a light, pan, or rain moves at the subtitle height,
    # preserve that motion at 24 fps and repaint only the covered text rectangles.
    decode = seek + ['-vf', crop, '-frames:v', str(end - start),
                     '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-']
    encode = FFMPEG + ['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}',
                       '-framerate', str(FPS), '-i', '-', '-filter_threads', '1',
                       '-vf', 'scale=out_color_matrix=bt601', *ENCODE, str(path)]
    with subprocess.Popen(decode, stdout=subprocess.PIPE) as reader, \
            subprocess.Popen(encode, stdin=subprocess.PIPE) as writer:
        size = w * h * 3
        j = 0
        for n in range(start, end):
            data = reader.stdout.read(size)
            if len(data) != size:
                raise RuntimeError(f'Incomplete motion patch at source frame {n}')
            if n == spans[j + 1]:
                j += 1
            pixels = np.frombuffer(data, dtype=np.uint8).copy().reshape((h, w, 3))
            band = pixels[BAND - y:]
            band[masks[j]] = clean_bands[j][masks[j]]
            writer.stdin.write(pixels)
        writer.stdin.close()
        if reader.wait() or writer.wait():
            raise RuntimeError(f'FFmpeg failed while separating shot {start}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--public-dir', required=True, type=Path)
    args = parser.parse_args()
    source = args.source.resolve(strict=True)
    out = args.public_dir.resolve() / 'du-mot-dot-xuong'
    out.mkdir(parents=True, exist_ok=True)

    print('Đo điểm cắt và mốc phụ đề…', flush=True)
    low = grab(source, 'scale=256:144,format=gray', 'gray', (144, 256))
    if len(low) != LENGTH:
        raise RuntimeError(f'Expected the {LENGTH}-frame reference, got {len(low)} frames')
    ink = low[:, 122:138, 10:-10] > 143
    cues = [0, *(np.flatnonzero(np.count_nonzero(ink[1:] != ink[:-1], axis=(1, 2)) > 50) + 1).tolist()]
    boundaries = sorted(set(CUTS) | set(cues))
    representatives = {b: min(b + 4, e - 1) for b, e in zip(boundaries, boundaries[1:])}
    selected = sorted({0, *representatives.values()})
    print(f'Lấy tư liệu cho {len(CUTS) - 1} cảnh, {len(cues)} câu phụ đề…', flush=True)
    frames = grab(source, 'select=' + select_frames(selected), 'rgb24', (HEIGHT, WIDTH, 3))
    images = dict(zip(selected, frames, strict=True))
    # The opening starts before any bones or callouts are visible.
    leaf_band = images[0][597 - np.arange(BAND, HEIGHT)]
    manifest = {}
    futures = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures.append(pool.submit(subprocess.run, FFMPEG + [
            '-i', str(source), '-map', '0:a:0', '-c:a', 'aac', '-b:a', '128k',
            '-movflags', '+faststart', str(out / 'soundtrack.m4a'),
        ], check=True))
        for start, end in zip(CUTS, CUTS[1:]):
            spans = [n for n in boundaries if start <= n <= end]
            samples = [images[0 if start == n == 0 else representatives[n]] for n in spans[:-1]]
            boxes = [caption_boxes(frame) for frame in samples]
            masks = [caption_mask(rects) for rects in boxes]
            bands = [frame[BAND:] for frame in samples]
            plates = [split_plate(frame, masks, bands, i, leaf_band if start in LEAF else None)
                      for i, frame in enumerate(samples)]
            Image.fromarray(plates[0]).save(out / f'plate-{start}.webp', lossless=True, method=3)
            rect = None if start == 0 else motion_rect(low[start:end], boxes)
            if rect is not None:
                left, top, right, bottom = rect
                futures.append(pool.submit(make_patch, source, start, end, rect, spans, masks,
                                           [p[BAND:].copy() for p in plates], out / f'motion-{start}.mp4'))
                rect = [left, top, right - left, bottom - top]
            subtitles = []
            for i, (b, e) in enumerate(zip(spans, spans[1:])):
                plate = plates[i] if rect is not None and rect[1] + rect[3] == HEIGHT else plates[0]
                box = save_caption(samples[i], plate, boxes[i], out / f'caption-{b}.png')
                cue_start = int(cues[bisect_right(cues, b) - 1])
                subtitles.append({'id': cue_start, 'file': b, 'from': int(b - start),
                                  'duration': int(e - b), 'box': box})
            manifest[start] = {'motion': rect, 'captions': subtitles}
        print('Hoàn tất hình nền và phụ đề; đợi các lớp chuyển động…', flush=True)
        for task in futures:
            task.result()

    temp = out / 'layers.json.tmp'
    temp.write_text(json.dumps(manifest, ensure_ascii=False), encoding='utf-8')
    temp.replace(out / 'layers.json')
    print(f'Đã tạo tài nguyên tại {out}', flush=True)


if __name__ == '__main__':
    main()
