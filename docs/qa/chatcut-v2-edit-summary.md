# GasBack ChatCut Peter V2 edit summary

Recorded on 2026-09-12. Peter V2 has been exported, technically checked and publicly hosted. The coordinator verified anonymous access, artifact-byte consistency and public browser playback to the end. The public session included a pause and resume. A full human listening and uninterrupted audiovisual acceptance pass has not been recorded.

## Editable project and current export

- [Open the editable ChatCut project](https://app.chatcut.io/editor/36890aa3-9738-4c53-b882-b3ff77eecaa2?chatcutLaunchClient=codex_app&chatcutLaunchSurface=ext_browser&chatcutLaunchRuntimeSource=codex_app__hosted_mcp). This is the editing workspace link, not the public judging video.
- Project ID: `36890aa3-9738-4c53-b882-b3ff77eecaa2`.
- Timeline ID: `8ac4f702-f215-4dbb-82ea-e93977534f18`.
- Local export: `C:/Users/stetang/Downloads/GasBack-demo-Peter-V2.mp4`.
- SHA-256: `beb180ef76f7e6059a9eb5fbbaa0bae6dea6bdd0760e18106fd80ce06b23fcfb`.

| Property | Verified result |
| --- | --- |
| File size | 12,123,810 bytes, below 25 MiB |
| Video | H.264, 1280 x 720, 24 fps, 2,640 frames |
| Video duration | 110.000 seconds |
| Audio | AAC, 48 kHz, stereo |
| Container/audio duration | 110.080 seconds |
| Extra audio tail | 80 ms, exact digital silence |
| Narration | User-selected Peter; seven separate editable clips on dedicated A1 |
| Captions | 24 editable caption cards, with a corrected SRT sidecar |

The local file size and SHA-256 were independently recomputed during this documentation update and matched the export-check record. No media was altered or re-encoded during this update.

## Seven-part synchronization

The seven visual cuts retain the completed testnet application's recordings and labeled evidence summaries. Each Peter narration clip starts at its corresponding visual segment and fits within that segment. The timeline uses 24 fps; frame intervals below are start-inclusive and end-exclusive.

| Segment | Visual frame interval | Timeline seconds | Placed narration length | Visual/evidence anchor |
| --- | --- | --- | --- | --- |
| 1 | 0-297 | 0.000-12.375 | 239 frames / 9.958 s | Completed GasBack app introduction |
| 2 | 297-687 | 12.375-28.625 | 348 frames / 14.500 s | Sponsor authorization summary |
| 3 | 687-1025 | 28.625-42.708 | 318 frames / 13.250 s | Real Sepolia failed receipt |
| 4 | 1025-1480 | 42.708-61.667 | 358 frames / 14.917 s | Native verification and observed attestation wait |
| 5 | 1480-1842 | 61.667-76.750 | 267 frames / 11.125 s | Mined claim and completed-payment replay |
| 6 | 1842-2195 | 76.750-91.458 | 331 frames / 13.792 s | Read-only rejection and separately labeled local policy tests |
| 7 | 2195-2640 | 91.458-110.000 | 344 frames / 14.333 s | Closing source, proof and payment links |

The original source audio is muted at track level and set to -60 dB per item. Peter clips use individual gain and short edge fades. Captions were generated from the dedicated narration source and placed above an editable bottom matte covering the older burned captions. The preserved V1 source recordings, export and production records remain available.

The [sync map](../submission/video/chatcut-v2-sync.json) retains its pre-export snapshot wording. Current export status is established by [the export-check record](chatcut-v2-export-check.json), completed at `2026-09-12T07:21:47.407463+00:00`, and the publication checks described below.

## Technical validation and limits

- Full FFmpeg decode passed without errors; video format, frame count, file hash and duration matched the expected export.
- Seven narration windows contained audio and fit within their assigned visual sections. Their intervening rests and the extra 80 ms tail were checked as silence.
- All 24 sidecar subtitle cues were inside the 110-second picture and their corresponding visual sections.
- Eight exported frames at 5, 20, 35, 50, 70, 84, 102 and 109 seconds were inspected by the export reviewer. Captions stayed within the canvas/matte and the evidence labels, receipt summary and timing overlays were legible.
- The sidecar's Attestcoin spelling was corrected; the corresponding exported video caption was already correct. No video re-encode was required for that correction.
- Frame quantization shortened the placed source narration clips by 6-27 ms relative to their reported source durations. Signal checks do not guarantee that every phoneme is intact; full human listening remains a separate acceptance check.
- Technical validation does not certify naturalness, pronunciation, pacing or complete audiovisual correspondence. No full human listening or uninterrupted audiovisual acceptance pass has been recorded.

## Public access status

- [Public video page](https://gasback-ctc-2026.stetang.chatgpt.site/demo.html).
- [Peter V2 MP4](https://gasback-ctc-2026.stetang.chatgpt.site/demo.mp4).
- [Corrected subtitle file](https://gasback-ctc-2026.stetang.chatgpt.site/demo.srt).
- [Evidence deck](https://gasback-ctc-2026.stetang.chatgpt.site/GasBack-deck.pdf).
- [Completed run](https://gasback-ctc-2026.stetang.chatgpt.site/evidence/run.json), [raw proof](https://gasback-ctc-2026.stetang.chatgpt.site/evidence/source-proof.json) and [reviewed public verification](https://gasback-ctc-2026.stetang.chatgpt.site/evidence/public-reverification-reviewed.json).

The coordinator confirmed anonymous HTTP 200 for these public artifacts. The public MP4, PDF, run, proof and reviewed-verification hashes match the local canonical files. Public browser playback finished with `currentTime=duration=110.08`, `ended=true`, `readyState=4` and no error. It paused at 98.78 s and then resumed for the ending; this confirms successful playback to the end, without claiming unattended continuous playback or human listening acceptance. See [the persisted public release record](public-release-check.json). No DoraHacks accepted-submission confirmation is established by this export or hosting result.
