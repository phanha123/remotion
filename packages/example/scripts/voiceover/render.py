"""Render a verified ElevenLabs release; preview and export share the same audio."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]


def render_project(project, illustrated=False):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--public-dir', type=Path, required=True, help='ElevenLabs release directory printed by prepare.py')
    parser.add_argument('--output', type=Path)
    parser.add_argument('--browser-executable', default='C:/Program Files/Google/Chrome/Application/chrome.exe')
    args = parser.parse_args()
    public = args.public_dir.resolve()
    manifest_file = public / 'manifest.json'
    if not manifest_file.is_file():
        raise SystemExit('Missing ElevenLabs manifest. Prepare a complete ElevenLabs release first; old audio is not used as a fallback.')
    manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
    source = ROOT / ('packages/example/src/NhanQua/story.json' if project == 'nhan-qua' else 'packages/example/src/Alex/timeline.json')
    if (manifest['provider'] != 'elevenlabs' or manifest['project'] != project or not manifest['complete']
            or manifest['sourceSha256'] != hashlib.sha256(source.read_bytes()).hexdigest()):
        raise SystemExit('Stale or incompatible audio manifest. Run prepare.py again for the current story.')
    for scene in manifest['scenes']:
        audio = public / scene['file']
        if audio.parent != public or not audio.is_file() or hashlib.sha256(audio.read_bytes()).hexdigest() != scene['audioSha256']:
            raise SystemExit('Prepared audio is missing or modified. Run prepare.py again.')
    track = public / ('music.m4a' if project == 'nhan-qua' else 'soundtrack.m4a')
    mix_file = public / 'soundtrack.json'
    if not track.is_file() or not mix_file.is_file():
        raise SystemExit('Soundtrack missing. Finish the Python prepare.py step, not just raw speech generation.')
    mix = json.loads(mix_file.read_text(encoding='utf-8'))
    if mix['file'] != track.name or mix['sha256'] != hashlib.sha256(track.read_bytes()).hexdigest():
        raise SystemExit('Soundtrack was modified. Run prepare.py again before rendering.')
    target = (args.output or public / ('Gieo-dieu-lanh-elevenlabs.mp4' if project == 'nhan-qua' else 'Mot-cho-cho-minh-elevenlabs.mp4')).resolve()
    if target.exists():
        raise SystemExit('Output already exists. Choose a new --output path; existing videos are preserved.')
    target.parent.mkdir(parents=True, exist_ok=True)
    entry = 'packages/example/src/NhanQua/entry.tsx' if project == 'nhan-qua' else ('packages/example/src/Alex/entry.tsx' if illustrated else 'packages/example/src/Alex/motion-entry.tsx')
    composition = 'LuatNhanQua' if project == 'nhan-qua' else ('MotChoChoMinh' if illustrated else 'AlexHoatHinh')
    subprocess.run(['node', 'packages/cli/remotion-cli.js', 'render', entry, composition, str(target),
                    f'--public-dir={public}', '--codec=h264', '--crf=19', '--x264-preset=fast',
                    '--concurrency=6', f'--browser-executable={args.browser_executable}'], cwd=ROOT, check=True)
    result = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
                        'format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate',
                        '-of', 'json', str(target)]))
    video = next((s for s in result['streams'] if s['codec_type'] == 'video'), None)
    audio = next((s for s in result['streams'] if s['codec_type'] == 'audio'), None)
    if (not video or video['codec_name'] != 'h264' or video['width'] != 1920 or video['height'] != 1080
            or video['r_frame_rate'] != '30/1' or not audio or audio['codec_name'] != 'aac'
            or abs(float(result['format']['duration']) - manifest['durationFrames'] / 30) > 0.15):
        raise SystemExit('Export completed but media verification failed. Inspect the output before delivery.')
    print(json.dumps(result, indent=2))
    print(f'Verified MP4: {target}')
