# Submission evidence validation

Refreshed on 2026-09-12 against `integration/evidence/run.json`, generated at `06:51:34.633 UTC`, status `completed-live-testnet-rebate`, and the stricter `public-reverification-reviewed.json` at `07:04:13.308 UTC`. The original `public-reverification.json` snapshot is preserved. The final Sites version has been deployed with the completed-run evidence, Peter V2 video, corrected SRT and evidence PDF; anonymous public file and hash checks passed.

## Evidence consistency

- The ticket confirmed before source broadcast. Independent RPC block timestamps: ticket 06:41:45 UTC, source failure 06:42:00 UTC. The source timestamp is not encoded in the Attestcoin proof.
- Source transaction `0xaa0c0551306e1e1fb0e2dd603439356ff472e48aadc3b0c8d88013d2760f3d9a`: status 0, zero logs, block 11,687,232. This is the project's prospective failure, not the earlier historical probe.
- Claim `0xd4dd04ac3686498d4baf090119dfbb7848c1ffba96724743669cb9f1de744035`: status 1, block 5,473,655. Gross rebate 1 test CTC; beneficiary net delta 0.9999184485 after gas 0.0000815515. The vault decreases from 10 to 9; totalPaid is 1; the ticket is consumed.
- Native proof and public RPC checks passed. Live read-only controls reject changed status, wrong source chain, unissued ticket and duplicate claim. There is no second mined claim. Authentic successful-receipt rejection remains in the local policy suite.
- Attestation readiness first observed after 8m 54.575s; native verification completed after 8m 57.415s; claim submission to confirmation 5.061s. These are run-specific local observations with 15-second polling, not latency guarantees.
- The CLI performed real transactions; the published app provides read-only replay/verification of the completed run. Publishing or replaying it does not create another claim.
- 42 local policy/security cases use a disclosed verifier harness. Neither those tests, the independent source review, nor explorer source verification is a professional audit.

## Artifact checks

The [fresh post-run review](../qa/final-code-review.md) **closed the P2 evidence-binding finding** in the independent public verifier. The corrected helper binds the signed source hash, decoded chain/nonce/target/calldata/gas/block fields, historical stored ticket, vault-emitted `TicketIssued` and `RebatePaid`, nullifier, amount, beneficiary and spent state. Independent results: **16/16 verifier regressions, 42/42 contract cases and 10/10 web tests passed**, plus live dual-chain RPC/native/balance/duplicate re-verification. The persisted reviewed record confirms `sourceTicketPaymentBindingConfirmed` and `vaultEventEmittersConfirmed`; the independent reviewer separately reran the same checks with output retained only in memory. No Critical or Important finding remains within this reviewed testnet code/evidence scope. This does not constitute a professional audit of the project or native precompile.

- Six-page 16:9 PDF generated with local ReportLab. No paid image, voice or media generation was used for the deck.
- All six updated pages were rendered with bundled Poppler and visually inspected. No clipping, overlap or missing glyphs was observed. Extraction checks validate six evidence labels, amounts, timing and seven clickable links including ticket, failure, claim and verified contract source.
- The released Peter V2 video has seven independently aligned narration clips and 24 caption cards; the original audio is muted. Export: 12,123,810 bytes, H.264/AAC, 1280 x 720, 24 fps, 2,640 video frames. Picture duration is 110.000 s; the 110.080 s container includes an 80 ms silent audio tail.
- Public repository: https://github.com/stetang98/gasback-attestcoin . The reviewed verifier, reviewed JSON and README were publicly accessible and matched their local versions during the pre-release check; documentation status updates are tracked separately.
- Final public app: https://gasback-ctc-2026.stetang.chatgpt.site . All seven release artifacts listed below returned anonymous HTTP 200. Public MP4, PDF, run, proof and reviewed-verification hashes exactly matched the local canonical files; SRT spelling is corrected to Attestcoin.
- Local playback reached 110.08 s with `ended=true` and no media error. Public playback also finished with `currentTime=duration=110.08`, `ended=true`, `readyState=4` and no error. The public session paused at 98.78 s and resumed for the ending; this records successful playback to the end, without claiming unattended continuous playback. No full human listening acceptance has been recorded.
- DoraHacks Details now contain the completed run and video/PDF/GitHub/chain links; Continue returned `Saved successfully`. The Profile Demo video field contains the published `/demo.html` URL and saved successfully. These are saved-draft observations, not accepted submission. Primary Telegram and informed personal eligibility confirmation remain outstanding.

## Published artifact checks

The coordinator's [public release record](../qa/public-release-check.json) retains the anonymous-response, hash and completed browser-playback observations.

| Artifact | Anonymous access | Byte/hash check |
| --- | --- | --- |
| [Video page](https://gasback-ctc-2026.stetang.chatgpt.site/demo.html) | HTTP 200 | Page access verified |
| [Peter V2 MP4](https://gasback-ctc-2026.stetang.chatgpt.site/demo.mp4) | HTTP 200 | SHA-256 `beb180ef76f7e6059a9eb5fbbaa0bae6dea6bdd0760e18106fd80ce06b23fcfb`, identical to local export |
| [SRT](https://gasback-ctc-2026.stetang.chatgpt.site/demo.srt) | HTTP 200 | Corrected Attestcoin sidecar available |
| [Evidence PDF](https://gasback-ctc-2026.stetang.chatgpt.site/GasBack-deck.pdf) | HTTP 200 | SHA-256 `9f3587c1c46f66a1d624b4c55a4dcae76e8c31ce1802948bcd87dcf6aca74c01`, identical to local PDF |
| [Completed run](https://gasback-ctc-2026.stetang.chatgpt.site/evidence/run.json) | HTTP 200 | Exact canonical local hash match |
| [Raw proof](https://gasback-ctc-2026.stetang.chatgpt.site/evidence/source-proof.json) | HTTP 200 | Exact canonical local hash match |
| [Reviewed verification](https://gasback-ctc-2026.stetang.chatgpt.site/evidence/public-reverification-reviewed.json) | HTTP 200 | Exact canonical local hash match |

## Publication handoff

The website, deck, Peter V2 video and evidence are publicly deployed and byte-checked; public browser playback reached the end successfully. Obtain the participant's required Telegram and informed eligibility confirmation, then submit the saved DoraHacks draft and record acceptance. Technical completion, publication, browser playback, human listening and accepted submission remain distinct observations.
