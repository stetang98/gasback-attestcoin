"""Render the six-page evidence deck from the independently verified live testnet run."""
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas

HERE = Path(__file__).resolve().parent
OUT = HERE / "GasBack-deck.pdf"
W, H = 960, 540
BG = HexColor("#0D1720")
PANEL = HexColor("#142431")
LINE = HexColor("#294150")
WHITE = HexColor("#F4F7F8")
MUTED = HexColor("#AFC0CB")
TEAL = HexColor("#5EE1CA")
AMBER = HexColor("#FFCB77")
SNAPSHOT = "2026-09-12 06:51 UTC"
SOURCE_URL = "https://sepolia.etherscan.io/tx/0xaa0c0551306e1e1fb0e2dd603439356ff472e48aadc3b0c8d88013d2760f3d9a"
TICKET_URL = "https://creditcoin-testnet.blockscout.com/tx/0x261916243b9d6b4ab526e38a98337eac7f50e371561153939b35c668ed647ac1"
CLAIM_URL = "https://creditcoin-testnet.blockscout.com/tx/0xd4dd04ac3686498d4baf090119dfbb7848c1ffba96724743669cb9f1de744035"
APP_URL = "https://stetang98.github.io/gasback-attestcoin/"
GITHUB_URL = "https://github.com/stetang98/gasback-attestcoin"
VAULT_URL = "https://creditcoin-testnet.blockscout.com/address/0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea?tab=contract"
OFFICIAL_URL = "https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail"

c = canvas.Canvas(str(OUT), pagesize=(W, H), pageCompression=1)
c.setTitle("GasBack | BUIDL CTC 2026 Fall | Verified testnet evidence")
c.setAuthor("GasBack project")
c.setSubject("Fixed sponsor rebates for preauthorized reverted transactions; testnet prototype")


def text(value, x, y, size=18, color=WHITE, bold=False):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.drawString(x, y, value)


def para(value, x, y, width, size=18, leading=25, color=MUTED, bold=False):
    font = "Helvetica-Bold" if bold else "Helvetica"
    lines = simpleSplit(value, font, size, width)
    for item in lines:
        text(item, x, y, size, color, bold)
        y -= leading
    return y


def box(x, y, width, height, fill=PANEL):
    c.setFillColor(fill)
    c.setStrokeColor(LINE)
    c.roundRect(x, y, width, height, 12, fill=1, stroke=1)


def base(number, section):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    text("GASBACK", 48, 499, 15, TEAL, True)
    text(section.upper(), 170, 499, 10, MUTED)
    text("TESTNET EVIDENCE", 780, 499, 11, AMBER, True)
    c.setStrokeColor(LINE)
    c.line(48, 478, 912, 478)
    c.line(48, 41, 912, 41)
    text("BUIDL CTC 2026 Fall / DeFi / Testnet assets only", 48, 23, 10, MUTED)
    text(f"On-chain snapshot: {SNAPSHOT}", 462, 23, 10, MUTED)
    text(f"{number:02d} / 06", 867, 23, 10, MUTED)


def link(label, url, x, y, size=13, color=TEAL):
    text(label, x, y, size, color)
    width = c.stringWidth(label, "Helvetica", size)
    c.linkURL(url, (x, y - 3, x + width, y + size), relative=0, thickness=0)


# 1 - Value proposition
base(1, "The user outcome")
text("Prove the failure.", 48, 414, 43, WHITE, True)
text("Claim the sponsor rebate.", 48, 360, 43, WHITE, True)
para("A fixed sponsor rebate for a preauthorized reverted transaction.", 50, 312, 820, 22, 28)
cards = [(48, "01", "Failed on Sepolia", AMBER), (342, "02", "Verified by Attestcoin", TEAL), (636, "03", "Rebated on Creditcoin", TEAL)]
for x, n, label, color in cards:
    box(x, 168, 276, 90)
    text(n, x + 19, 226, 12, color, True)
    para(label, x + 19, 198, 238, 18, 22, WHITE, True)
box(48, 64, 864, 72)
text("VERIFIED LIVE RUN", 66, 108, 10, TEAL, True)
text("Ticket first. Status 0, zero logs. Native proof. Fixed 1 test CTC paid.", 66, 83, 18)
c.showPage()

# 2 - Product problem, without invented adoption data
base(2, "A precise job")
text("Give a sponsorship budget a clear rule.", 48, 417, 33, WHITE, True)
box(48, 211, 416, 158)
box(486, 211, 426, 158)
text("FOR THE USER", 69, 339, 12, TEAL, True)
para("Show an eligible failure. Claim a known amount.", 69, 307, 370, 24, 31, WHITE, True)
para("Inspect the receipt and the policy instead of asking an operator to interpret the outcome.", 69, 250, 369, 16, 21)
text("FOR THE SPONSOR", 507, 339, 12, TEAL, True)
para("Authorize exact intent. Bound the payout.", 507, 307, 380, 24, 31, WHITE, True)
para("Set one-use tickets and fund a limited campaign. No blanket promise for every failed transaction.", 507, 250, 380, 16, 21)
text("PRODUCT HYPOTHESIS", 48, 173, 11, AMBER, True)
para("Sponsored recovery may improve onboarding for participating protocols. Demand and retention impact still need validation.", 48, 146, 864, 19, 25)
text("Fixed subsidy. No insurance, full gas reimbursement or fault judgment.", 48, 70, 17, MUTED)
c.showPage()

# 3 - Protocol-dependent architecture
base(3, "Attestcoin integration")
text("Attestcoin is in the payment path.", 48, 417, 35, WHITE, True)
steps = [
    ("01", "Authorize", "Sponsor issues an exact ticket before the action."),
    ("02", "Fail", "Sepolia records a genuine failed receipt."),
    ("03", "Prove", "Relayer supplies payload + inclusion/continuity proof."),
    ("04", "Verify", "Native 0xFD2 checks payload and source height."),
    ("05", "Pay once", "Vault checks status 0, ticket policy and replay."),
]
for i, (n, label, body) in enumerate(steps):
    y = 355 - i * 45
    text(n, 50, y, 12, TEAL, True)
    text(label, 91, y, 18, WHITE, True)
    text(body, 215, y, 18, MUTED)
box(48, 63, 864, 65)
text("REMOVE THE PROTOCOL", 66, 102, 10, AMBER, True)
text("Remove the independent remote-failure check that authorizes payment.", 66, 78, 18, WHITE)
c.showPage()

# 4 - Security and validation
base(4, "Hostile-input checks")
text("A claim should survive hostile inputs.", 48, 417, 34, WHITE, True)
rows = [
    ("Changed status 0 -> 1", "Native: Merkle proof validation failed."),
    ("Wrong source chain", "Vault: WrongSourceChain."),
    ("Unissued ticket", "Vault: TicketNotIssued."),
    ("Duplicate claim", "Vault: TicketAlreadyClaimed; no second payout."),
    ("Success / intent / reentry", "Additional policy cases covered in local tests."),
]
for i, (attack, control) in enumerate(rows):
    y = 353 - i * 45
    if i % 2 == 0:
        c.setFillColor(PANEL)
        c.rect(48, y - 13, 864, 37, fill=1, stroke=0)
    text(attack, 61, y, 17, WHITE, True)
    text(control, 339, y, 17, MUTED)
text("4 live read-only rejection checks", 48, 119, 22, TEAL, True)
para("Plus 42 local policy/security cases using a disclosed verifier harness. Authentic success, wrong intent, transfer failure and reentry are local tests. The source review is not a professional audit.", 48, 87, 854, 14, 19)
c.showPage()

# 5 - Honest live evidence
base(5, "Inspectable evidence")
text("A failure without logs. A paid rebate.", 48, 417, 35, WHITE, True)
box(48, 276, 864, 105)
text("FIXED GROSS REBATE", 67, 355, 11, TEAL, True)
text("1 test CTC", 67, 312, 34, WHITE, True)
text("Net received: 0.9999184485 test CTC", 404, 337, 19, WHITE, True)
text("Claim gas paid: 0.0000815515 test CTC", 404, 309, 16, MUTED)
link("Ticket: Creditcoin #5,473,617 / confirmed before source broadcast", TICKET_URL, 48, 251, 14)
link("Failure: Sepolia #11,687,232 / status 0 / zero logs", SOURCE_URL, 48, 224, 14)
link("Claim: Creditcoin #5,473,655 / status 1 / vault balance 10 -> 9", CLAIM_URL, 48, 197, 14)
text("OBSERVED TIMING", 48, 160, 11, AMBER, True)
text("Attestation ready: 8m 54.575s. Native verified: 8m 57.415s.", 48, 133, 19, WHITE)
text("Claim submission to confirmation: 5.061s.", 48, 108, 17, MUTED)
text("15-second polling; local observations, not exact publication times or latency guarantees.", 48, 82, 12, MUTED)
text("CLI executed the transactions. The website provides read-only replay and verification.", 48, 57, 12, TEAL)
c.showPage()

# 6 - Focused next step and non-fictional traction
base(6, "Product validation")
text("A small pilot. A measurable next step.", 48, 417, 33, WHITE, True)
para("First intended users: protocols testing bounded onboarding or retry sponsorship.", 48, 369, 849, 22, 28)
box(48, 209, 418, 114)
box(484, 209, 428, 114)
text("PILOT PROPOSAL", 67, 293, 11, TEAL, True)
para("One protocol. One action. A fixed budget and a clear eligibility rule.", 67, 262, 376, 21, 27, WHITE, True)
text("PROPOSED MEASURES", 503, 293, 11, TEAL, True)
para("Proof latency, claim completion, rejection causes, sponsor spend and retry behavior.", 503, 262, 382, 19, 25)
text("NEXT GATE", 48, 175, 11, AMBER, True)
para("Publish the synchronized demo and evidence. Then validate demand with one sponsor before expanding scope.", 48, 148, 852, 20, 26)
text("One verified testnet run. No claimed traction, partners, revenue or accepted submission.", 48, 99, 13, MUTED)
link("GasBack live demo", APP_URL, 48, 78, 11)
link("Source: github.com/stetang98/gasback-attestcoin", GITHUB_URL, 486, 78, 11)
link("Official competition", OFFICIAL_URL, 48, 56, 10)
link("Fully verified vault source on Blockscout", VAULT_URL, 486, 56, 10)
c.showPage()
c.save()
print(OUT)
