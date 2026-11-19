"""Prepare ElevenLabs narration and the original score without replacing old audio."""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / 'packages/example/scripts/voiceover'))
from prepare import original_score, prepare_project, publish_soundtrack


def main():
    out = prepare_project('nhan-qua')
    if out is None:
        return
    subprocess.run([
        'ffmpeg', '-v', 'error', '-y', '-stream_loop', '-1', '-i', str(original_score()),
        '-t', '60', '-af', 'afade=t=in:d=2,afade=t=out:st=56:d=4',
        '-c:a', 'aac', str(out / 'music.m4a'),
    ], check=True)
    publish_soundtrack(out, 'music.m4a')
    print(f'Ready: 60 seconds, ElevenLabs narration and original music. Public directory: {out}')


if __name__ == '__main__':
    main()
