"""Render the six-page review draft. Update facts only from verified public evidence."""
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
SNAPSHOT = "2026-09-12 05:56 UTC"
SOURCE_URL = "https://sepolia.etherscan.io/tx/0x11c6cadadf3b945cda0b2cb4129e736932518cc7d042c83d67fbcb68c2676267"
APP_URL = "https://gasback-ctc-2026.stetang.chatgpt.site"
GITHUB_URL = "https://github.com/stetang98/gasback-attestcoin"
OFFICIAL_URL = "https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail"

c = canvas.Canvas(str(OUT), pagesize=(W, H), pageCompression=1)
c.setTitle("GasBack | BUIDL CTC 2026 Fall | Review draft")
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
    text("REVIEW DRAFT", 802, 499, 11, AMBER, True)
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
text("CURRENT EVIDENCE", 66, 108, 10, AMBER, True)
text("Source deployed. Full native proof and target rebate are pending.", 66, 83, 18)
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
    ("Tampered evidence", "Native verifier rejects changed proof-bound bytes."),
    ("Success / wrong intent", "Receipt status and exact ticket checks reject it."),
    ("Replayed source transaction", "Chain + verified sender + nonce cannot pay twice."),
    ("Redirected payout", "The ticket fixes beneficiary and rebate."),
    ("Payment failure / reentry", "Atomic rollback and a claim guard protect state."),
]
for i, (attack, control) in enumerate(rows):
    y = 353 - i * 45
    if i % 2 == 0:
        c.setFillColor(PANEL)
        c.rect(48, y - 13, 864, 37, fill=1, stroke=0)
    text(attack, 61, y, 17, WHITE, True)
    text(control, 339, y, 17, MUTED)
text("42 local policy/security cases", 48, 119, 22, TEAL, True)
para("Disclosed verifier harness. Independent source review: no actionable P0-P2 at eb31caa. Neither is a professional audit or native-integration certificate.", 48, 87, 854, 14, 19)
c.showPage()

# 5 - Honest live evidence
base(5, "Inspectable evidence")
text("Proof is a deliverable.", 48, 417, 36, WHITE, True)
box(48, 238, 864, 132)
text("VERIFIED: SEPOLIA SOURCE DEPLOYMENT", 67, 339, 12, TEAL, True)
text("Block 11,686,978 / receipt status 1", 67, 307, 24, WHITE, True)
text("0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea", 67, 275, 16, MUTED)
link("Inspect the source deployment receipt", SOURCE_URL, 67, 251, 12)
text("PENDING AT THIS SNAPSHOT", 48, 207, 11, AMBER, True)
para("Target vault and prospective ticket. Eligible source failure. Native proof and tamper rejection. Mined rebate and duplicate rejection.", 48, 181, 852, 19, 25)
link("Public app: gasback-ctc-2026.stetang.chatgpt.site", APP_URL, 48, 107, 14)
link("Public source: github.com/stetang98/gasback-attestcoin", GITHUB_URL, 48, 85, 14)
text("Public review PDF in repository; final prospective-run refresh pending. Video pending.", 48, 65, 11, MUTED)
text("Historical proof is not a rebate. No accepted entry claimed.", 48, 49, 10, MUTED)
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
para("Complete the real proof-to-payment run and publish reproducible evidence. Validate sponsor demand before expanding scope.", 48, 148, 852, 20, 26)
text("No claimed traction, partners, revenue or accepted submission.", 48, 78, 15, MUTED)
link("Official competition", OFFICIAL_URL, 48, 56, 10)
c.showPage()
c.save()
print(OUT)
