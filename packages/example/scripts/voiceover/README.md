# ElevenLabs narration for local animated films

Run all commands from the repository root. Requires Bun, Python 3, FFmpeg and
FFprobe. No ElevenLabs SDK, edge-tts or NumPy installation is needed.
These scripts run locally, never in the Remotion browser bundle.

## 1. Configure securely

Revoke any API key exposed in a chat. Create a new restricted ElevenLabs key.
Add the placeholders from this directory's `.env.example` to the **root `.env`**;
do not overwrite an existing `.env`. It is already gitignored. Bun loads it and
the Python wrappers invoke Bun with the repository root as working directory.

- `ELEVENLABS_API_KEY`: secret, only read by the local generator.
- `ELEVENLABS_VOICE_ID`: a voice accessible to your account; not a voice name.
- `ELEVENLABS_MODEL_ID`: `eleven_v3` (default, expressive), or
  `eleven_flash_v2_5` (economical). Both support Vietnamese.

Do **not** use `eleven_multilingual_v2` for Vietnamese. The runtime checks that
the selected model supports Vietnamese and that the voice is accessible before
submitting a new generation. No account/subscription modification is performed.

The requested voice is **male, warm/deep, Northern Vietnamese**. No voice ID has
been selected automatically: labels cannot guarantee accent or performance.

```sh
bun packages/example/scripts/voiceover/elevenlabs.ts --models
bun packages/example/scripts/voiceover/elevenlabs.ts --voices
```

These are authenticated read-only requests, not speech generation. Voice listing
shows the first 100 account voices and preview URLs; use the ElevenLabs voice
library to find more voices if necessary. Add your chosen voice ID to `.env`.

## 2. Inspect, audition, approve

```sh
python -X utf8 packages/example/src/NhanQua/prepare.py --dry-run
bun packages/example/scripts/voiceover/elevenlabs.ts --sample
```

Dry-run is also the default when no mode is supplied. It does not make API
requests or write files, and works without credentials. It lists cache hits and
text character counts, **not a guaranteed credit or currency price**. Context,
model, plan and billing rules can affect actual charges. Check your account's
current allowance and configure spending limits there where available.

`--sample` is an explicit **paid** request if not cached. It creates one short
sample (roughly 10–20 seconds, depending on delivery), not a complete movie.
Listen to the MP3 path it prints. Check Northern pronunciation, warmth, clarity
and pacing. Only **after the user approves what they hear**, run:

```sh
bun packages/example/scripts/voiceover/elevenlabs.ts --approve-voice
```

Approval is local and bound to that voice/model/preset and verified sample.
Changing these requires another audition and approval. Approval is not an
automatic accent classifier. The default v3 preset uses stability 0.5; Flash
uses stability 0.55, similarity 0.75 and speed 0.95. Preset changes invalidate
cache and approval. Output is `mp3_44100_128`, not a higher-tier output format.

## 3. Generate a release

```sh
python -X utf8 packages/example/src/NhanQua/prepare.py --generate --confirm-spend
# Opt in separately for Alex; it is NOT generated automatically:
python -X utf8 packages/example/src/Alex/prepare.py --generate --confirm-spend
```

The scripts keep the existing scene slots (30 fps, 60 seconds for Nhan Qua).
Speech is padded with silence if short, or time-stretched by at most 1.08x if
slightly long. Oversized clips produce an actionable error instead of being
truncated or excessively sped up. Their raw audio remains cached; shorten the
specific narration or deliberately revise scene/action timing before retrying.
Alex's animated sequences now read `timeline.json`, matching the illustrated
version. No regeneration rewrites its timeline behind your back.

Raw cache is shared under `out/voiceover/elevenlabs/`. Fingerprints include text,
voice, model, language, settings, format, previous/next text and revision. Checksums
and provider sidecars prevent legacy or incomplete MP3s from being accepted.
Changing a scene can invalidate neighboring scenes because their context changes.

To synthesize only a selected scene (IDs are printed by dry-run):

```sh
python -X utf8 packages/example/src/NhanQua/prepare.py --generate --confirm-spend --scene 2
python -X utf8 packages/example/src/Alex/prepare.py --generate --confirm-spend --scene intro
```

If other clips are missing, only raw cache is saved; no complete release is
published. Run without `--scene` to finish. To request a deliberate new take,
use a new `--revision` value (e.g. `--revision take-2`) consistently on subsequent
commands. Revisions create a new fingerprint rather than overwriting old takes.
No seed-based determinism is promised; saved audio is the reproducible artifact.

Prepared releases live in `out/<project>/elevenlabs/<content-hash>/`. The printed
`VOICEOVER_RESULT` points to metadata; the Python wrapper adds the music or mixed
soundtrack. A new configuration does not overwrite prior release directories or
the original Edge/Google audio and MP4s. Existing original music is reused; when
absent, the original procedural arpeggio is recreated locally without an API.

Requests are sequential and never automatically retried. A timeout may occur
after a generation was billed: check ElevenLabs history before retrying. Invalid
keys, permissions, voice access, quota and HTTP failures stop the process. There
is **no Microsoft/Google fallback** and no automatic credit purchase.

## 4. Preview and export

Replace `<release-dir>` with the exact directory printed by Python, not the
legacy `out/nhan-qua` or `out/alex` directories:

```sh
node packages/cli/remotion-cli.js studio packages/example/src/NhanQua/entry.tsx --public-dir="<release-dir>" --no-open
python -X utf8 packages/example/src/NhanQua/render.py --public-dir "<release-dir>"
```

For Alex, use `src/Alex/motion-entry.tsx` in Studio and
`src/Alex/render-motion.py` to export; `src/Alex/render.py` exports the illustrated
version. All entries include audio in both preview and render; no second mux.
The render wrapper validates the source hash, prepared audio hashes, music track,
and complete ElevenLabs manifest. It refuses to overwrite an existing MP4; use
`--output` for a new filename. After export it verifies H.264/AAC, 1920×1080,
30 fps and duration. The default Windows Chrome path can be changed with
`--browser-executable`.

Preview, seeking and rendering use only local audio and never contact ElevenLabs.
All output audio, approval and cache files are gitignored. They must be copied or
regenerated when moving machines; `.env` must never be copied into public assets.
Alex SRT timings are approximate sentence timings, not forced alignment.

## References

- https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- https://elevenlabs.io/docs/models
- Existing `@remotion/elevenlabs` handles transcript/caption conversion, not TTS.
