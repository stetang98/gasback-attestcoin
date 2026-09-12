# GasBack video production materials

## Current revision: Peter V2 exported and publicly hosted

The participant selected Peter for the replacement narration. ChatCut V2 has been exported from the [editable project](https://app.chatcut.io/editor/36890aa3-9738-4c53-b882-b3ff77eecaa2?chatcutLaunchClient=codex_app&chatcutLaunchSurface=ext_browser&chatcutLaunchRuntimeSource=codex_app__hosted_mcp), with seven independently aligned narration clips on a dedicated audio track, seven source cuts, 24 editable caption cards and an editable matte covering the old burned captions. The original source audio is muted. The local V1 export is preserved as source footage and history; it is not the current replacement.

Current export: `C:/Users/stetang/Downloads/GasBack-demo-Peter-V2.mp4`, **12,123,810 bytes**, **1280 x 720**, **24 fps / 2,640 frames**, H.264 with AAC audio. The video stream is **110.000 seconds**; the container is **110.080 seconds**, with an extra **80 ms of exact digital silence** in the audio tail. SHA-256: `beb180ef76f7e6059a9eb5fbbaa0bae6dea6bdd0760e18106fd80ce06b23fcfb`.

[Watch Peter V2](https://gasback-ctc-2026.stetang.chatgpt.site/demo.html) · [MP4](https://gasback-ctc-2026.stetang.chatgpt.site/demo.mp4) · [corrected SRT](https://gasback-ctc-2026.stetang.chatgpt.site/demo.srt) · [PDF deck](https://gasback-ctc-2026.stetang.chatgpt.site/GasBack-deck.pdf). The coordinator confirmed anonymous HTTP 200 and exact local/public hashes for the MP4, PDF and completed-run evidence. The sidecar subtitle spells **Attestcoin** correctly. Public browser playback reached `currentTime=duration=110.08`, `ended=true`, `readyState=4`, with no error. That session paused at 98.78 s and then resumed through the ending, so it is not described as unattended continuous playback. No complete human listening pass has been recorded; technical checks do not establish human approval of the voice.

See [V2 edit and publication summary](../../qa/chatcut-v2-edit-summary.md), [independent export checks](../../qa/chatcut-v2-export-check.json) and [public release evidence](../../qa/public-release-check.json). `chatcut-v2-sync.json` preserves the pre-export editing snapshot, including its then-pending export labels; the export-check record and this section supersede those labels for current export/publication status.

## Preserved V1 production history

The records below describe the preserved local V1 production and its technical checks. They are historical records and do not replace the Peter V2 export or its separate public-playback and listening checks.

**The original narration was prepared while the live run was still in progress. Its WAV filename and JSON retain their historical `DRAFT` wording to preserve their hashes. Final MP4 evidence readiness is established by the passed evidence gates and input fingerprints in `GasBack-demo.manifest.json`, not by renaming those original production assets. Human playback and public upload verification remain separate checks.**

- `GasBack-English-DRAFT-evidence-pending.wav`: approximately 110 seconds, uncompressed PCM WAV, 48 kHz, 16-bit, mono. It is a local production asset; do not commit the large audio file to Git.
- `narration-en.txt`: editable spoken English only. The first-person success statements in this file remain conditional on the evidence gates.
- `narration-en.json`: editable seven-part script plus explicit evidence gates. Edit this source and regenerate the WAV and plain text together.
- `narration-metadata.json`: actual synthesis voice, duration, segment timing, checksum and verification limits. Use the measured segment times when editing, rather than assuming the planning time ranges are exact.
- `audio-validation.json`: checks for this generated WAV: full decode, exact duration and format, checksum agreement and zero full-scale clipped PCM samples. Rerun validation after regenerating audio.
- `generate-narration.ps1`: reproducible local Windows generation using `System.Speech` and the installed Microsoft Zira Desktop voice. No paid API, downloads or browser automation is used.

The narration is based on `../demo-script.md`. It explicitly says that the source demo deliberately reverts, that the payment is a fixed sponsor subsidy rather than a full gas refund, and that all assets are test assets. The duplicate rejection is described as a read-only call. Altered-payload and successful-source checks are described as local policy tests, avoiding a claim that extra rejection transactions were mined.

The timing script adjusts speech rate, retains every spoken word, inserts 0.3 seconds between sections, and pads the end with silence to the target duration. It never cuts speech to fit. Final timings, including any padding, are recorded in the metadata.

This machine exposed enabled `en-US` voices Microsoft Zira Desktop, Microsoft David Desktop, Microsoft Mark, Microsoft Zira and Microsoft David. The selected Zira Desktop render contains 214 words. Its speech and section gaps occupy 106.622 seconds, followed by approximately 3.379 seconds of end-card silence. FFprobe confirmed exactly 110.000 seconds and 10,560,044 bytes; FFmpeg decoded the entire file without error. PCM peak is approximately -2.61 dBFS, with zero full-scale clipped samples. This is technical validation only; no human listening pass has been performed.

Run from Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\docs\submission\video\generate-narration.ps1
```

Before release, confirm actual ticket issuance, matching status-zero Sepolia source receipt, native proof verification, status-one Creditcoin payment receipt and event identity, read-only duplicate rejection, public evidence links, and the on-screen local-test labels. Complete a full human listen and a final picture-to-narration check. Technical WAV validation is not a human listening pass. Nothing in this folder constitutes publication or proof that the live run has completed.

## Editable 110-second MP4 assembly

`assemble.py` uses the installed Python/Pillow and FFmpeg tools. It performs no browser interaction, RPC request, wallet access, Git operation or publication. All outputs stay in this directory; original recordings are read-only.

Required inputs (paths are relative to this directory and editable in `assembly.json`):

| Input | Required contents |
| --- | --- |
| `../../../integration/evidence/run.json` | Final normalized `completed-live-testnet-rebate` run, including status-zero source, successful claim, reconciled beneficiary transfer, native verification, tampering rejection, duplicate rejection and measured timing. |
| `../../../integration/evidence/public-reverification.json` | Actual successful output written by `integration/verify-public.cjs`, for the same source transaction, claim, ticket and amount. |
| `capture/01-hero-completed/` | Final completed-run app JPEGs and `frames.json`; at least about 12.34 seconds. Earlier `capture/01-hero/` is preserved and excluded from final assembly. |
| `capture/04-verification/` | Actual app verification/replay JPEGs and `frames.json`; at least about 18.94 seconds. This is a recorded RPC check, not a staged fresh wallet claim. |
| `capture/05-payment/` | Actual app completed-demo replay and paid-state JPEGs and `frames.json`; at least about 15.10 seconds. |
| `narration-en.json`, `narration-metadata.json` and referenced WAV | Existing 110-second narration with matching checksum and exact SAPI paragraph times. |
| `local-policy-tests.json` and `.tap` | Generated by the local test refresh command below. Two actual local EVM checks cover successful receipt and tampered payload. |

Each `frames.json` is an ordered array such as `[{"file":"00000.jpg","timestamp":1789195586.843441}, ...]`. Timestamps are seconds. Conversion selects the most recent actual frame at each 24 fps output time, preserving 1x playback speed. It does not infer a frame rate from file count, interpolate fake UI, accelerate an RPC wait or modify originals. A short clip freezes on its last real frame and displays `HELD FRAME`; longer clips are trimmed. `trimStartSeconds` can be adjusted in `assembly.json` to choose a different source interval.

The sequence follows the measured narration paragraph starts, with the 0.3-second paragraph gaps assigned to the preceding shot:

| Section | Output interval | Visual source |
| --- | --- | --- |
| Introduction | 0.000-12.334 s | `capture/01-hero-completed/` actual recording |
| Sponsor ticket | 12.334-28.619 s | `EVIDENCE SUMMARY` card derived from final run |
| Source failure | 28.619-42.704 s | `EVIDENCE SUMMARY` card derived from final run |
| Native verification | 42.704-61.643 s | `capture/04-verification/`, actual measured waiting overlay |
| Payment | 61.643-76.742 s | `capture/05-payment/` actual read-only replay |
| Rejections | 76.742-91.452 s | Separate recorded eth_call and `LOCAL POLICY TESTS` labels |
| Close | 91.452-110.000 s | `EVIDENCE SUMMARY` card with the public `stetang` app/repository links |

All frames show `RECORDED TESTNET RUN / edited playback`. The verification section shows source-failure-to-attestation and source-failure-to-native-verification intervals computed from the final observation timestamps, and explicitly says waiting was cut. These are local observation intervals, not exact protocol attestation publication time. No segment imitates a fresh signature or claims instant settlement.

The payment recording retains the real app viewport and adds a separate `EVIDENCE SUMMARY / CREDITCOIN MINED CLAIM RECEIPT` banner containing the exact mined claim hash, status and event amount from the run. This supplies the receipt evidence referenced by the narration without imitating an explorer screenshot or inventing an app control.

The sentence subtitles are burned into the picture and also exported to editable `subtitles.json` / `.srt`. Paragraph anchors are exact; sentence intervals are estimates based on word count, not speech-recognition alignment. Adjust these intervals after listening. The generator retains an existing subtitle file on a later build; use `--reset-subtitles` only when intentionally regenerating it.

From the repository root:

```powershell
# One-time local policy evidence; compiles only in memory, writes logs under video/.
python docs/submission/video/assemble.py --refresh-local-tests --check

# Optional: marked draft evidence-card PNGs; never produces a final video.
python docs/submission/video/assemble.py --preview-cards --check

# Once the two remaining recordings and final evidence are present:
python docs/submission/video/assemble.py --build

# Gate/resampling regression checks; no network or browser use.
python docs/submission/video/test_assembly.py
```

The build stops if the paid evidence, exact identities, proof, duplicate rejection, observed timings, current local-test fingerprints or required recordings are missing/inconsistent. `assembly-preflight.json` lists blockers. There is no override to render a final success video from a pending run.

The final file is `GasBack-demo.mp4`: H.264, AAC, 1280x720, 24 fps, 110 seconds, fast-start enabled. `GasBack-demo.manifest.json` records input hashes, actual transaction hashes, capture provenance, timing and technical checks. `work/` contains evidence-card PNGs, several QC stills and the FFmpeg log. A `.rendering.mp4` is provisional until format and full-decode validation pass. Existing final/provisional outputs are preserved; choose a new output name in `assembly.json` for another version.

The final output is still a local production artifact. Human full playback, subtitle timing, source-pixel legibility, on-screen-to-audio correspondence and public upload verification remain separate steps. Do not commit WAV, MP4, JPEG sequences or generated work/ assets to Git as ordinary source files.

## Completed local export

`GasBack-demo.mp4` was built after the final run and public reverification passed all gates. It is **110.000 seconds**, **1280x720**, **24 fps / 2,640 frames**, **H.264 + AAC**, and **3,778,479 bytes (3.603 MiB)**, below the requested 25 MiB upload ceiling. SHA-256: `13fea50331ae41cec304a038da2148d8cfdba5918269a1ea8000f5ccb1baaf55`.

Full FFmpeg decoding and format validation passed. Key frames at 5, 20, 35, 50, 70, 84, 102 and 109 seconds were extracted from this final MP4; the evidence cards, subtitles, recorded-playback labels, measured timing and receipt-summary banner were inspected without finding text overflow. See `qc-final-v2/` and `video-validation.json`. The 4 assembly gate/resampling checks and 2 actual local EVM policy cases passed. A full human listen and uninterrupted audiovisual playback have not been performed by this assembling agent. This folder has not been published or committed by the assembling agent.

`work/first-pass-*` and `qc-final/` preserve the initial assembly before the receipt-summary banner was added. They are earlier versions, excluded from the final deliverable. Original narration files and all original JPEG captures remain unchanged.
