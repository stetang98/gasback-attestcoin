# Submission evidence validation

Refreshed on 2026-09-12 against `integration/evidence/run.json`, generated at `06:51:34.633 UTC`, status `completed-live-testnet-rebate`, and the stricter `public-reverification-reviewed.json` at `07:04:13.308 UTC`. The original `public-reverification.json` snapshot is preserved. The initial completed-run integration evidence was published at `17da7ec`; later review and documentation changes require their own public synchronization check.

## Evidence consistency

- The ticket confirmed before source broadcast. Independent RPC block timestamps: ticket 06:41:45 UTC, source failure 06:42:00 UTC. The source timestamp is not encoded in the Attestcoin proof.
- Source transaction `0xaa0c0551306e1e1fb0e2dd603439356ff472e48aadc3b0c8d88013d2760f3d9a`: status 0, zero logs, block 11,687,232. This is the project's prospective failure, not the earlier historical probe.
- Claim `0xd4dd04ac3686498d4baf090119dfbb7848c1ffba96724743669cb9f1de744035`: status 1, block 5,473,655. Gross rebate 1 test CTC; beneficiary net delta 0.9999184485 after gas 0.0000815515. The vault decreases from 10 to 9; totalPaid is 1; the ticket is consumed.
- Native proof and public RPC checks passed. Live read-only controls reject changed status, wrong source chain, unissued ticket and duplicate claim. There is no second mined claim. Authentic successful-receipt rejection remains in the local policy suite.
- Attestation readiness first observed after 8m 54.575s; native verification completed after 8m 57.415s; claim submission to confirmation 5.061s. These are run-specific local observations with 15-second polling, not latency guarantees.
- The CLI performed real transactions; the app provides read-only replay/verification. Local completed-run UI verification is separate from the pending public v2 refresh.
- 42 local policy/security cases use a disclosed verifier harness. Neither those tests, the independent source review, nor explorer source verification is a professional audit.

## Artifact checks

The [fresh post-run review](../qa/final-code-review.md) **closed the P2 evidence-binding finding** in the independent public verifier. The corrected helper binds the signed source hash, decoded chain/nonce/target/calldata/gas/block fields, historical stored ticket, vault-emitted `TicketIssued` and `RebatePaid`, nullifier, amount, beneficiary and spent state. Independent results: **16/16 verifier regressions, 42/42 contract cases and 10/10 web tests passed**, plus live dual-chain RPC/native/balance/duplicate re-verification. The persisted reviewed record confirms `sourceTicketPaymentBindingConfirmed` and `vaultEventEmittersConfirmed`; the independent reviewer separately reran the same checks with output retained only in memory. No Critical or Important finding remains within this reviewed testnet code/evidence scope. This does not constitute a professional audit of the project or native precompile.

- Six-page 16:9 PDF generated with local ReportLab. No paid image, voice or media generation was used for the deck.
- All six updated pages were rendered with bundled Poppler and visually inspected. No clipping, overlap or missing glyphs was observed. Extraction checks validate six evidence labels, amounts, timing and seven clickable links including ticket, failure, claim and verified contract source.
- The approximately 110-second script contains 184 English narration words and describes recorded CLI execution and read-only replay. The editable video has seven segments; the prior narration is muted, and replacement narration awaits the participant's voice choice. The revised final video is not claimed published.
- Public repository: https://github.com/stetang98/gasback-attestcoin . Completed-run evidence has been pushed; the new PDF and documentation must be synchronized separately.
- Public app: https://gasback-ctc-2026.stetang.chatgpt.site . Public v1 access was verified without account cookies; public v2 with final evidence/media is pending at this document's refresh.
- Planned direct PDF `/GasBack-deck.pdf` and video `/demo.mp4` paths are not claimed publicly accessible until their actual responses and playback are checked.
- DoraHacks login is complete, but accepted submission and an actual BUIDL URL are not evidenced. The user's own Telegram and informed qualification declaration remain participant fields, not data to invent or publish in this repository.

## Publication handoff

Publish the synchronized website, deck and video. Verify the publicly served evidence and media against these local artifacts, then complete the actual DoraHacks fields and record acceptance. Technical completion, public artifact availability and accepted submission are separate states.
