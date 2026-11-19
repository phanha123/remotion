"""Export the illustrated Alex ElevenLabs release with the same audio as preview."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / 'packages/example/scripts/voiceover'))
from render import render_project

if __name__ == '__main__':
    render_project('alex', illustrated=True)
