# Submission evidence validation

Refreshed on 2026-09-12 against the completed prospective run and reviewed public RPC verification. GitHub Pages is deployed; seven anonymous HTTP 200 responses and exact local/public hash matches are recorded in `docs/qa/github-pages-release-check.json` at 07:47:24 UTC. The live app proof/native/payment UI check passed. At approximately 07:48 UTC, DoraHacks confirmed [GasBack BUIDL 48594](https://dorahacks.io/buidl/48594) submitted to BUIDL CTC 2026 Fall and Under Review (not publicly visible yet), not judging approval or an award.

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
- The current Peter V3 export is 12,121,489 bytes, SHA-256 `d20a94b87b962702367f379bfb23bd2fcd8240f0ec42b6bd8c6b982556041c1c`; its public file matches the local release. The Peter narration uses seven aligned clips and 24 caption cards, with the original audio muted. The prior V2 production checks remain historical records.
- Public repository: https://github.com/stetang98/gasback-attestcoin . The reviewed verifier, reviewed JSON and README were publicly accessible and matched their local versions during the pre-release check; documentation status updates are tracked separately.
- Public app: https://stetang98.github.io/gasback-attestcoin/ . Seven release files returned anonymous HTTP 200 and matched local hashes. The app UI verified the actual proof, native verification and payment, displaying REBATE PAID and 1.0 test CTC with replay blocked. This read-only UI verification does not initiate a new claim.
- Current Peter V3 public playback completed with currentTime=duration=110.08 s, ended=true, paused=true, readyState=4 and error=null. The source was demo.mp4?v=peter-v3. No complete human listening acceptance has been recorded.
- DoraHacks Profile, Details, Team and Contact were restored with GitHub Pages links and saved successfully; all required fields were filled, DeFi selected and Need teammates set to No. Final submission displayed BUIDL Submitted! and confirmed the entry is now Under Review (not publicly visible yet). The entry is https://dorahacks.io/buidl/48594 and remains editable before judging. The participant self-declared organizer eligibility; no independent verification, judging approval or prize entitlement is claimed. Contact values remain private.
- The signed-in final Submission Terms of Use Agreement, clause 4, names citizens of the People's Republic of China and countries subject to OFAC sanctions in its BUIDL-related financial-transactions restriction. It does not directly prohibit this free technical project submission. The separate grant-donation restriction concerns making donations, and the optional Hackathon Prize Safe describes third-party handling of prize funds. Future prize eligibility, payment methods and the financial clause's application to this season's advertised USD-denominated awards remain unresolved; they are not treated as a precondition for uploading this nonfinancial entry. This reading is not a legal guarantee or authorization to initiate a financial transaction.

## GitHub Pages artifact verification

The [GitHub Pages release record](../qa/github-pages-release-check.json) records seven anonymous HTTP 200 responses and local/public hash matches. Later live UI and submission observations are described above; the earlier release record remains historical evidence.

| Artifact | Anonymous access | Byte/hash check |
| --- | --- | --- |
| [Video page](https://stetang98.github.io/gasback-attestcoin/demo.html) | HTTP 200 | Exact local/public hash match; current V3 playback reached 110.08 s, ended=true, no media error |
| [Peter V3 MP4](https://stetang98.github.io/gasback-attestcoin/demo.mp4) | HTTP 200 | 12,121,489 bytes; SHA-256 `d20a94b87b962702367f379bfb23bd2fcd8240f0ec42b6bd8c6b982556041c1c`; matches local |
| [SRT](https://stetang98.github.io/gasback-attestcoin/demo.srt) | HTTP 200 | Exact local/public hash match; Attestcoin spelling corrected |
| [Evidence PDF](https://stetang98.github.io/gasback-attestcoin/GasBack-deck.pdf) | HTTP 200 | 12,205 bytes; SHA-256 `c5e06b0efea9bfbd4af766ee25e72c8e52a289310855c32ec67bd15326717aee`; matches local |
| [Completed run](https://stetang98.github.io/gasback-attestcoin/evidence/run.json) | HTTP 200 | Exact canonical local/public hash match |
| [Raw proof](https://stetang98.github.io/gasback-attestcoin/evidence/source-proof.json) | HTTP 200 | Exact canonical local/public hash match |
| [Reviewed verification](https://stetang98.github.io/gasback-attestcoin/evidence/public-reverification-reviewed.json) | HTTP 200 | Exact canonical local/public hash match |

## Publication handoff

GitHub Pages publication, anonymous file/hash verification, live app proof/native/payment verification and DoraHacks submission receipt are confirmed. The entry is Under Review (not publicly visible yet); no judging approval or award is claimed. Peter V3 public playback reached 110.08 s with ended=true and no media error. Personal eligibility is self-declared, without independent verification. Future prize eligibility and payment require separate clarification before any prize-related financial transaction; the private inquiry draft has not been sent. This unresolved future matter is not an unsubmitted-entry blocker.
