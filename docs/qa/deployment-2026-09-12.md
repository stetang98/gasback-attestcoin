# GasBack deployment verification

Verified on 2026-09-12, around 06:30 UTC.

- Production URL: https://gasback-ctc-2026.stetang.chatgpt.site/
- The participant explicitly authorized public access for judges. The hosting service returned `access_mode: public` (revision 2).
- A fresh PowerShell HTTP request without browser cookies returned HTTP 200 and the expected GasBack page title.
- Browser verification on the production origin fetched and verified historical Sepolia transaction `0x736afe589dcc92742c9a5fd78cdbbd14b141349b5d656f4493f1688da7957b5e` through Creditcoin's native verifier. The page displayed `PROOF VERIFIED` and `Failed · status 0`.
- With no sponsor ticket, the claim button remained disabled and showed `A sponsor ticket is required`.
- This historical sample establishes read-only proof verification. It is not evidence of a GasBack ticket, rebate, or completed prospective testnet run.

Deployment provenance:

- Root source commit: `466fda8` (web subtree).
- Standalone Site source commit: `f9e5d419181c8e006ec8631256552418b12d72f8`.
- Site project: `appgprj_6aa4e64f74848191abccaa1103cd846e`.
- Saved version: `appgprj_6aa4e64f74848191abccaa1103cd846e~appgver_36cfe9e6e9788191a24fee00cff41515` (version 1).
- Successful deployment: `appgdep_6aa4f0d04d588191991689423b47fe48`.
- Archive SHA-256: `65c1de53fbd8453b4ea7c8191b4c180977b502c9ef35cb8f291eee2135742743`.

The actual production hostname supersedes the provisional `jazzy-lamp-4850` hostname in earlier drafts.
