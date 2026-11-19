# Một chỗ cho mình

Vietnamese animated short about kindness, boundaries and rediscovering art.
1920×1080, 30 fps; the current shared `timeline.json` is 152.1 seconds.

## ElevenLabs narration workflow

New narration uses **ElevenLabs only**, not Edge TTS or Google fallback.
Requested delivery: warm/deep male, preferably Northern Vietnamese. A specific
voice must be auditioned and approved before generating the complete film.

See [the shared voiceover guide](../../scripts/voiceover/README.md) for secure
`.env` configuration, sample generation, local approval and cost/cache controls.
Do not paste API keys into source, public files or chat.

From the repository root:

```sh
python -X utf8 packages/example/src/Alex/prepare.py --dry-run
# Only after configuring credentials, auditioning and approving the voice:
python -X utf8 packages/example/src/Alex/prepare.py --generate --confirm-spend
```

The Python wrapper prints a versioned `<release-dir>` under
`out/alex/elevenlabs/<hash>/`. Preparation keeps the current shared scene slots.
Audio may be stretched at most 1.08x; oversized speech is rejected rather than
cut off. Edit narration or deliberately adjust the timeline/actions if necessary.
The animated and illustrated entries both read timing from `timeline.json`.
SRT files use approximate sentence timings, not forced alignment.

## Fully animated film (no text on screen)

Entry: `motion-entry.tsx`, composition `AlexHoatHinh`.
Characters walk, type, handle phones, paint, refuse and offer tea. Clouds,
trees, birds, cars, rain, curtains, steam and river reflections animate.

```sh
node packages/cli/remotion-cli.js studio packages/example/src/Alex/motion-entry.tsx --public-dir="<release-dir>" --no-open
python -X utf8 packages/example/src/Alex/render-motion.py --public-dir "<release-dir>"
```

Use the actual Studio URL printed, select `AlexHoatHinh`, press Play/Space.
The exact same soundtrack plays in preview and render, with no second mux.
Neither preview nor export calls ElevenLabs. Default new output:
`<release-dir>/Mot-cho-cho-minh-elevenlabs.mp4`.

## Illustrated version

Entry: `entry.tsx`, composition `MotChoChoMinh`. This older presentation has
Vietnamese captions and is preserved separately from the text-free animation.

```sh
node packages/cli/remotion-cli.js studio packages/example/src/Alex/entry.tsx --public-dir="<release-dir>" --no-open
python -X utf8 packages/example/src/Alex/render.py --public-dir "<release-dir>" --output "<release-dir>/Mot-cho-cho-minh-illustrated-elevenlabs.mp4"
```

## Existing deliverables

The original `out/alex/Mot-cho-cho-minh.mp4`,
`out/alex/Mot-cho-cho-minh-hoat-hinh.mp4`, narration and soundtrack remain
untouched. They are **not ElevenLabs versions**. To inspect the historical
animation, use its old `out/alex` public directory explicitly; new render wrappers
require a complete ElevenLabs release and never silently fall back to it.

Output assets are gitignored. Copy them or prepare them again on another machine.
The original local score is reused when present, or recreated procedurally
offline when missing. Requirements: Bun, Python 3, FFmpeg, FFprobe, network for
new speech only, and Chrome for rendering. No edge-tts or NumPy dependency.
