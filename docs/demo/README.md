# Demo video

| File | What it is |
|---|---|
| `final.mp4` | The demo video with captions: 1920x1080, 30 fps, H.264 + AAC 48 kHz, faststart |
| `me.png` | Osama's photo, used on the end card |
| `thumbnail-frame.png` | A frame from the title moment |
| `voice.mp3` | Osama's voice, the 9 lines in `docs/VIDEO.md` |
| `fire.mp3` | Fire crackle (YouTube Audio Library) |

Length: 64.0 s. Size: 19.9 MB.
Loudness: -14.1 LUFS integrated, -2.7 dBTP true peak, 3.1 LU loudness range (ffmpeg ebur128). Target was about -14 LUFS and under -1 dBTP.
No music: the sound is the voice, the fire crackle and a low space rumble (both ducked by 6 dB while the voice speaks), and short effects made with ffmpeg (whoosh, click, pop, riser, soft boom, spark, shimmer).

## How it was made
Everything lives in `video/`, separate from the website, so the site's dependencies do not change.

1. **Script and timing.** `voice.mp3` has no long pauses, so it was split at its 9 sentence ends (the 0.2 to 0.6 s gaps) rather than at 3 second pauses. Word times for the karaoke captions come from forced alignment of the exact words with PocketSphinx (`video/scripts/align.py` writes `video/src/data/lines.json`). The captions use the recorded words, and `docs/VIDEO.md` matches them.
2. **Audio** (`npm run audio`, `video/scripts/audio.mjs`): 80 Hz high-pass and a gentle de-esser on the voice, the 9 cuts, the fire bed, a brown-noise rumble low-passed at 120 Hz, and the effects, all with ffmpeg.
3. **Screen recording** (`npm run record`, `video/scripts/record.cjs`): Playwright drives the production build at 1920x1080, device scale 2, with an injected cursor (dark arrow, soft shadow) and an orange click ring. Each scene is a CDP screencast (about 50 fps) turned into a 30 fps clip in `video/public/clips/`, with click times and element boxes in `clips.json`. The Ask answer comes from the cached answers in `data/demo-answers.json`; no answer is made up.
4. **Edit** (Remotion, `video/src/`): one timeline (`timeline.ts`, `cues.ts`) sets every scene by its voice line. Spring camera zooms, callouts with lucide icons, side panels, embers in scenes 1, 2 and 9, a progress bar, and transitions (blur-dissolve, zoom-through, slide, wipe), each with a whoosh. Click sounds sit on the recorded click times.
5. **Render** (`npm run render`, `video/scripts/render.mjs`): the video without captions, the mixed audio, and the captions as a transparent overlay; then two-pass loudnorm, a true-peak limiter and the MP4.

## Re-render
```bash
cd video && npm install
```
```bash
npm run audio
```
Only if the site changed (the site must be running: `npm run build && npm start` in the repo root):
```bash
npm run record
```
```bash
npm run render
```
New voice recording: put it in `docs/demo/voice.mp3`, update the lines in `video/scripts/align.py`, run it (needs `pip install pocketsphinx`), then `npm run audio` and `npm run render`.

## Checks
- Stills from the middle of every scene (frames 71, 201, 376, 623, 869, 1100, 1344, 1551, 1774) and every callout moment (221 side panel, 409 problem icon, 672 "Re-ranks live", 732 "Each one shows why", 852 "Plain language", 942 "Side by side", 1175 "See how they connect", 1383 "Every claim has a source", 1613 "What's missing", 1898 end card): text readable, nothing cut off, no spinner or error, no callout over the cursor, never more than 2 overlays at once. Two callouts were moved after this check.
- Captions: all 9 lines match the Voice column of `docs/VIDEO.md` word for word (script check).
- Other on-screen words come from the site ("Back to the Moon", "Flame in Freefall"), from the facts in `docs/VIDEO.md` ("Fire behaves differently without gravity"), from the voice ("Combustion experiments in microgravity", "Hard to read", "Plain language") or are the callout labels from the brief for this video.
- Sound: one audio stream, no music. Click sounds sit 1 frame after each recorded press; the ring shows 1 to 2 frames after the press (screencast delay, measured with `video/scripts/check-sync.py`), so every click sound is within 1 frame of its ring.
- The recording had no page errors (Playwright console and page error log).

## Fallbacks and notes
- The voice file did not have 3 second pauses between lines, so it was split at the sentence ends and the word times come from forced alignment.
- In line 6 the speech recognizer heard "See, you can see"; the captions show that.
- The "1967 · Apollo 1" title subtitle was left out: the recorded voice does not mention Apollo 1, and overlays only appear while the voice talks about them.
- The end card shows Osama's photo and his LinkedIn and GitHub names (no URLs). LinkedIn is not in simple-icons or lucide, so a plain "in" badge stands in for its icon.
- Remotion rendered fine, so the ffmpeg-only fallback was not needed.
