# GasBack design QA
final result: passed

## Scope and source
The user requested the visual style of the public Expense It template, applied to the existing GasBack product. This is an adaptation, not a clone of its private expense-management backend.
Source: https://expense-it.lovable.app/login and https://lovable.dev/templates/apps/finance/expense-it-mobile-expense-reimbursement-template
Implementation: http://127.0.0.1:4173/
Source screenshots: ../docs/qa/screenshots/source-desktop.png and source-mobile.png.
Implementation screenshots: ../docs/qa/screenshots/gasback-desktop.png, gasback-error-desktop.png and gasback-mobile.png.
Browser: Codex in-app browser. Desktop nominal CSS viewport 1280 x 720; mobile 390 x 844. Native captures exclude the implementation's 15 px scroll bar and may be scaled by the host surface; comparisons used the visible app content, not the host chrome. CDP captures affected by Windows display scaling were discarded and overwritten with the normal browser screenshots. No visual evidence was taken from a guessed screenshot or the DOM alone.

## Comparison history
1. Desktop source and implementation captured together: matching original Inter family, oversized white two-line title, black background, real DarkVeil shader, translucent form card, underlined inputs and green primary button. Product-specific header, two transaction fields and proof section are intentional.
2. Mobile first pass: title too heavy and large, card retained desktop padding and translucency, making the main form too tall. P2. Changed mobile title to Inter 48 px regular and removed the enclosing glass/padding; kept explicit GasBack purpose.
3. Desktop type detail: changed title tracking from -.06em to the source's -.025em, input font from 14 to 16 px and primary/secondary labels to 14 px. P2 fixed.
4. Final mobile source and implementation captured together after fixes: one-column layout, main verification and sample actions reachable in the first screen, no horizontal document overflow (measured scrollWidth=390). Primary controls, inputs and text are readable. Source mobile screenshot shows 390 x 844; the app capture excludes its scroll bar. Different amount of explanatory text is intentional, not a promised hidden source state.

## Required surfaces
- Typography: locally vendored official Inter variable font. Desktop 900 display weight and mobile regular title match the source direction. Labels use compact uppercase; controls use readable 14-16 px text.
- Spacing/layout: desktop split hero and rounded glass form; mobile single column and unboxed form. Extra top navigation and proof/evidence content implement GasBack's own user journey.
- Colors/tokens: black, white, green accent, dark translucent surfaces; error/verified colors are functional additions.
- Assets: actual open-source DarkVeil GLSL and OGL, retained licenses. No screenshot used as a page background, no hand-drawn substitute for the shader. Animation phases differ; matching a moving frame exactly is not the requirement.
- Copy: GasBack wording replaces expense and authentication content. Testnet labels, sponsor eligibility, no-ticket state and limits are explicit. No fabricated payout count or amount.
Focused typography, field labels and button regions were legible in the full-width captures; inspection also included computed font, input and card styles from the source.

## Interaction and evidence checks
- Visible invalid-hash submission: clear error, no proof or payout shown.
- Native proof verification: historical failed Sepolia sample verified via the real Creditcoin precompile in-browser. Missing ticket leaves claim disabled. This is historical feasibility evidence, not a GasBack payment.
- WebMCP valid input returned verified=true/status=0/eligible=false; invalid hash rejected deliberately.
- No wallet path has a friendly explanation; Node control-flow reviewer checked zero sends.
- Source proof fields, ticket matching and paid-event identity regression tests: 10/10 pass. See independent frontend review.
- Observed browser console had no errors/warnings for the loaded app. A missing optional manifest was replaced with an explicit pending manifest.
- Real wallet signing, configured GasBack campaign and actual payout remain a separate live-integration gate; this visual QA does not claim they are complete.

## Remaining work outside design QA
Creditcoin funding, live target deployment/ticket/failure/proof/payment, public source upload, public deployment, final PDF/video and DoraHacks submission.

