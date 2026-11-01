---
name: demo-check
description: Step 4. Run the exact demo flow in a real browser, catch errors, take screenshots, and record a backup video so a live-demo failure cannot sink the pitch. Use before freeze, before recording the video, and right before presenting, or when the user says "test the demo" or "is it ready".
---

# Demo Check: prove the demo works

Read the demo script in `.plans/spec.md`.

## 1. Check the live link

- Open the deployed URL in a fresh browser context (no cookies), as a judge would.
- Confirm it loads in under 5 seconds and there are no console errors.
- Confirm required env vars and API keys work in production, not only locally.

## 2. Walk the script with Playwright

Write `scripts/demo-check.(ts|js|py)` that:
- Follows each step of the demo script exactly, with real waits for real responses.
- Takes a screenshot per step into `docs/demo/`.
- Collects console errors and failed network requests.
- Runs at desktop size and at a phone size (390 by 844).

Run it. Look at every screenshot yourself. Report anything broken, slow, cut off, or ugly.

## 3. Failure drills

Answer each, and fix what you can:
- What if the AI API is slow or rate-limited? Is there a cached answer or a clear loading state?
- What if the venue or home internet drops? Is there a recorded backup?
- What if the judge types something unexpected into the main input?

## 4. Backup recording

Record a smooth run of the demo with Playwright video (`recordVideo`), at 1280 by 720 or larger, into `docs/demo/backup.webm`. Convert to mp4 with ffmpeg if available. This is the fallback if the live demo fails, and the base for the submission video.

## 5. Report

Write `docs/DEMO_CHECK.md`: pass or fail per step, screenshots list, open issues ordered by how visible they are in the demo.
