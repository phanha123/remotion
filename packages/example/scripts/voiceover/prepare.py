"""Bridge existing film preparation to the local-only ElevenLabs Bun CLI."""
import json
import math
import subprocess
import sys
import wave
from array import array
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]


def original_score():
    """Reuse the existing original recording, or recreate the original arpeggio offline."""
    existing = ROOT / 'out/alex/score.wav'
    if existing.is_file():
        return existing
    target = ROOT / 'out/voiceover/original-score.wav'
    if target.is_file():
        return target
    target.parent.mkdir(parents=True, exist_ok=True)
    rate, length = 24000, 180
    samples = array('f', [0]) * (rate * length)
    chords = [(130.81, 164.81, 196.00, 246.94), (110, 130.81, 164.81, 220),
              (87.31, 130.81, 174.61, 220), (98, 146.83, 196, 246.94)]
    for beat in range(math.ceil(length / 0.8)):
        frequency = chords[(beat // 8) % 4][beat % 4] * (2 if beat % 8 >= 4 else 1)
        start = round(beat * 0.8 * rate)
        for j in range(min(4 * rate, len(samples) - start)):
            t = j / rate
            tone = (math.sin(2 * math.pi * frequency * t)
                    + 0.24 * math.sin(4 * math.pi * frequency * t)
                    + 0.07 * math.sin(6 * math.pi * frequency * t))
            samples[start + j] += tone * (1 - math.exp(-t * 32)) * math.exp(-t * 1.7) * 0.075
    pcm = array('h', (round(max(-1, min(1, value * min(i / rate / 3, 1) * min((length - i / rate) / 5, 1))) * 32767)
                      for i, value in enumerate(samples)))
    if sys.byteorder != 'little':
        pcm.byteswap()
    temporary = target.with_suffix('.tmp.wav')
    with wave.open(str(temporary), 'wb') as wav:
        wav.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
        wav.writeframes(pcm.tobytes())
    temporary.replace(target)
    return target


def prepare_project(project):
    args = sys.argv[1:]
    # Dry-run, voice listing and sampling do not touch music or existing exports.
    result = subprocess.run(
        ['bun', 'packages/example/scripts/voiceover/elevenlabs.ts', '--project', project, *args],
        cwd=ROOT, capture_output=True, encoding='utf-8', errors='replace',
    )
    print(result.stdout, end='')
    if result.returncode:
        print(result.stderr, end='', file=sys.stderr)
        raise SystemExit(result.returncode)
    lines = [line for line in result.stdout.splitlines() if line.startswith('VOICEOVER_RESULT=')]
    if not lines:
        return None
    manifest_file = Path(lines[-1].split('=', 1)[1])
    manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
    if manifest['provider'] != 'elevenlabs' or not manifest['complete']:
        raise SystemExit('Refusing an incomplete or non-ElevenLabs manifest.')
    return Path(manifest['outputDir'])


def publish_soundtrack(out, filename):
    import hashlib
    track = out / filename
    manifest = json.loads((out / 'manifest.json').read_text(encoding='utf-8'))
    duration = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(track)]))
    if abs(duration - manifest['durationFrames'] / manifest['fps']) > 0.1:
        raise SystemExit('Soundtrack duration mismatch. Release is not ready for rendering.')
    info = {'file': filename, 'sha256': hashlib.sha256(track.read_bytes()).hexdigest()}
    temporary = out / 'soundtrack.json.tmp'
    temporary.write_text(json.dumps(info, indent=2) + '\n', encoding='utf-8')
    temporary.replace(out / 'soundtrack.json')
