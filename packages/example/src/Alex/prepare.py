"""Prepare ElevenLabs audio against the existing, shared Alex scene timeline."""
import json
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
sys.path.insert(0, str(ROOT / 'packages/example/scripts/voiceover'))
from prepare import original_score, prepare_project, publish_soundtrack


def main():
    out = prepare_project('alex')
    if out is None:
        return
    timeline = json.loads((HERE / 'timeline.json').read_text(encoding='utf-8'))
    length = sum(scene['duration'] for scene in timeline) / 30
    args = ['ffmpeg', '-v', 'error', '-y', '-stream_loop', '-1', '-i', str(original_score())]
    filters = ['[0:a]volume=0.5[music]']
    for i, scene in enumerate(timeline):
        args.extend(['-i', str(out / f'voice-{i}.mp3')])
        # The shared preparer already adds 450 ms of narration lead-in.
        filters.append(f'[{i + 1}:a]adelay={round(scene["fromFrame"] / 30 * 1000)}:all=1[v{i}]')
    inputs = '[music]' + ''.join(f'[v{i}]' for i in range(len(timeline)))
    filters.append(f'{inputs}amix=inputs={len(timeline) + 1}:normalize=0,alimiter=limit=0.95[a]')
    subprocess.run(args + ['-filter_complex', ';'.join(filters), '-map', '[a]', '-t', str(length),
                          '-c:a', 'aac', '-b:a', '192k', str(out / 'soundtrack.m4a')], check=True)
    publish_soundtrack(out, 'soundtrack.m4a')
    # Approximate sentence captions, not ElevenLabs forced alignment.
    subtitles = []
    for scene in timeline:
        start = scene['fromFrame'] / 30 + 0.45
        available = scene['duration'] / 30 - 1.1
        for sentence in re.findall(r'[^.!?]+[.!?]*', scene['text']):
            end = start + available * len(sentence) / len(scene['text'])
            def timestamp(value):
                milliseconds = round(value * 1000)
                hours, milliseconds = divmod(milliseconds, 3600000)
                minutes, milliseconds = divmod(milliseconds, 60000)
                seconds, milliseconds = divmod(milliseconds, 1000)
                return f'{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}'
            subtitles.append(f'{len(subtitles) + 1}\n{timestamp(start)} --> {timestamp(end)}\n{sentence.strip()}\n')
            start = end
    (out / 'phu-de.srt').write_text('\n'.join(subtitles), encoding='utf-8')
    print(f'Ready: {length:.1f}s. Shared timeline unchanged. Public directory: {out}')


if __name__ == '__main__':
    main()
