"""Local evidence-gated GasBack video assembly. Never fetches, signs or publishes.

All generated files stay under this directory. Original capture frames are read-only.
Pillow creates explicitly labelled evidence summaries, never imitation app screenshots.
"""
from __future__ import annotations

import argparse
import bisect
from collections import OrderedDict
from datetime import datetime, timezone
from decimal import Decimal
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import sys
import wave

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BG, PANEL, LINE = '#07110b', '#102319', '#264532'
GREEN, WHITE, MUTED, AMBER = '#86ff6b', '#f2fff2', '#b6cab8', '#ffd58b'
IDS = ['01-introduction', '02-sponsor-ticket', '03-source-failure',
       '04-native-verification', '05-fixed-payment', '06-rejection-checks', '07-close']


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def write_json(path, value):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(value, indent=2) + '\n', encoding='utf-8')


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def resolve(value):
    return (HERE / value).resolve()


def inside_output(path):
    path = path.resolve()
    if not path.is_relative_to(HERE):
        raise ValueError('Generated output must stay inside docs/submission/video')
    if path.is_relative_to(HERE / 'capture'):
        raise ValueError('Capture source files are read-only')
    return path


def get(obj, dotted, default=None):
    for part in dotted.split('.'):
        if not isinstance(obj, dict) or part not in obj:
            return default
        obj = obj[part]
    return obj


def same(a, b):
    return a is not None and b is not None and str(a).lower() == str(b).lower()


def int_value(value):
    return int(str(value), 16 if str(value).startswith('0x') else 10)


def seconds_between(start, end):
    return (datetime.fromisoformat(end.replace('Z', '+00:00')) -
            datetime.fromisoformat(start.replace('Z', '+00:00'))).total_seconds()


def ctc(value):
    if value is None:
        return 'PENDING'
    return format(Decimal(str(value)) / Decimal(10**18), 'f').rstrip('0').rstrip('.') if int(value) % 10**18 else str(int(value) // 10**18)


def elapsed_label(seconds):
    if seconds is None:
        return 'PENDING MEASUREMENT'
    minutes, rest = divmod(seconds, 60)
    return f'{int(minutes)} min {rest:04.1f} s' if minutes >= 1 else f'{rest:.1f} s'


def local_policy_run():
    """Two relevant local EVM tests; compile() defaults to in-memory, write=False."""
    names = ['rejects proof-authenticated successful receipt without consuming ticket',
             'rejects tampered payload bound to a different verified proof']
    args = ['node', '--test', '--test-reporter=tap', '--test-concurrency=1',
            '--test-name-pattern=successful receipt|tampered payload', 'test/gasback.test.cjs']
    result = subprocess.run(args, cwd=ROOT / 'chain', capture_output=True, text=True,
                            encoding='utf-8', errors='replace', timeout=180)
    output = result.stdout + result.stderr
    log = HERE / 'local-policy-tests.tap'
    log.write_text(output, encoding='utf-8')
    passed = result.returncode == 0 and all(
        re.search(r'^ok \d+ - ' + re.escape(name) + r'\s*$', output, re.M) for name in names)
    sources = ['chain/contracts/GasBackVault.sol', 'chain/test/gasback.test.cjs',
               'chain/test/helpers/TestContracts.sol', 'chain/scripts/compile.cjs']
    evidence = {'observedAt': utc_now(), 'mode': 'LOCAL POLICY TESTS; in-memory Ganache EVM with mock verifier',
                'passed': passed, 'exitCode': result.returncode, 'testNames': names,
                'sourceSha256': {p: sha(ROOT / p) for p in sources},
                'logFile': log.name, 'logSha256': sha(log),
                'boundary': 'Application policy only; not a live native proof or mined testnet rejection.'}
    write_json(HERE / 'local-policy-tests.json', evidence)
    if not passed:
        raise ValueError('Local policy tests did not pass; inspect local-policy-tests.tap')
    print('Two local policy tests passed; evidence saved under video/.', flush=True)


def validate_evidence(run, public, local):
    errors = []
    def require(condition, reason):
        if not condition:
            errors.append(reason)
    require(run.get('status') == 'completed-live-testnet-rebate', 'run.status is not completed-live-testnet-rebate')
    require(run.get('networkMode') == 'testnet-only', 'Expected testnet-only evidence')
    require(get(run, 'networks.source.chainId') == 11155111 and get(run, 'networks.target.chainId') == 102031,
            'Expected Sepolia and Creditcoin testnet chain IDs')
    require(run.get('proofVerified') is True and get(run, 'proofVerification.verified') is True,
            'Native proof verification is incomplete')
    require(run.get('duplicateRejected') is True and get(run, 'duplicateRejection.rejected') is True,
            'Duplicate rejection is incomplete')
    require(get(run, 'duplicateRejection.errorName') == 'TicketAlreadyClaimed', 'Duplicate rejection reason mismatch')
    require('eth_call' in str(get(run, 'duplicateRejection.mode', '')), 'Duplicate check must be labelled read-only eth_call')
    require(get(run, 'sourceFailure.fixtureType') == 'prospective-ticket-live-testnet-demo', 'Prospective source fixture required')
    for path, expected in [('sourceFailure.receipt.status', 0), ('ticket.receipt.status', 1), ('claim.receipt.status', 1)]:
        require(get(run, path) == expected, path + ' mismatch or missing')
    for path, expected in [('sourceFailure.receipt.transactionHash', run.get('sourceTxHash')),
                           ('proofVerification.sourceTransaction', run.get('sourceTxHash')),
                           ('claim.sourceTransaction', run.get('sourceTxHash')),
                           ('claim.receipt.transactionHash', run.get('claimTxHash')),
                           ('sourceFailure.ticketId', run.get('ticketId')),
                           ('ticket.ticketId', run.get('ticketId')),
                           ('claim.ticketId', run.get('ticketId')),
                           ('duplicateRejection.ticketId', run.get('ticketId')),
                           ('claim.beneficiary', run.get('beneficiary')),
                           ('ticket.ticket.beneficiary', run.get('beneficiary')),
                           ('claim.amount', run.get('rebateWei')),
                           ('ticket.ticket.rebate', run.get('rebateWei')),
                           ('claim.vault', run.get('vaultAddress')),
                           ('claim.receipt.to', run.get('vaultAddress')),
                           ('ticket.vault', run.get('vaultAddress')),
                           ('sourceFailure.authorizationTransaction', get(run, 'ticket.receipt.transactionHash'))]:
        require(same(get(run, path), expected), path + ' identity mismatch')
    for proven, source, ticket in [('from', 'sender', 'sourceSender'), ('to', 'target', 'sourceTarget'),
                                   ('nonce', 'nonce', 'sourceNonce')]:
        require(same(get(run, 'proofVerification.decoded.' + proven), get(run, 'sourceFailure.' + source)),
                'Verified source ' + proven + ' mismatch')
        require(same(get(run, 'sourceFailure.' + source), get(run, 'ticket.ticket.' + ticket)),
                'Ticket source ' + source + ' mismatch')
    require(same(get(run, 'sourceFailure.data'), get(run, 'ticket.sourceData')) and
            same(get(run, 'sourceFailure.data'), get(run, 'proofVerification.decoded.data')), 'Exact calldata mismatch')
    require(same(get(run, 'sourceFailure.calldataHash'), get(run, 'ticket.ticket.calldataHash')), 'Calldata hash mismatch')
    require(get(run, 'proofVerification.decoded.receiptStatus') == 0, 'Decoded source receipt must have status zero')
    require(get(run, 'proofVerification.tamperRejected') is True, 'Real native tamper check is missing')
    require(get(run, 'claim.beneficiaryTransfer.verified') is True, 'Beneficiary balance reconciliation missing')
    try:
        block = int_value(get(run, 'sourceFailure.receipt.blockNumber'))
        require(block == int_value(get(run, 'proofVerification.headerNumber')) == int_value(get(run, 'claim.sourceBlock')),
                'Proved source block mismatch')
        require(int_value(get(run, 'ticket.ticket.minSourceBlock')) <= block <= int_value(get(run, 'ticket.ticket.maxSourceBlock')),
                'Source block is outside ticket range')
        require(int_value(get(run, 'sourceFailure.gasLimit')) >= int_value(get(run, 'ticket.ticket.minGasLimit')), 'Gas limit below ticket minimum')
        require(int_value(get(run, 'sourceFailure.value')) == int_value(get(run, 'proofVerification.decoded.value')) == 0,
                'Source value must be zero')
        require(int_value(get(run, 'claim.targetBlockTimestamp')) <= int_value(get(run, 'ticket.ticket.claimDeadline')),
                'Claim was mined after ticket deadline')
    except (TypeError, ValueError):
        errors.append('Source block/gas/value or claim deadline numeric evidence missing')
    for key in ['nativeVerified', 'sourceFailureConfirmed', 'targetPayoutConfirmed']:
        require(public.get(key) is True, 'public-reverification.' + key + ' is not true')
    for key in ['sourceTxHash', 'claimTxHash', 'ticketId', 'rebateWei']:
        require(same(public.get(key), run.get(key)), 'Public reverification ' + key + ' differs from run')
    require(same(public.get('vaultCodeHash'), get(run, 'targetDeployment.codeHash')), 'Public vault bytecode hash mismatch')
    try:
        require(public['authorizationTargetBlockTimestamp'] < public['sourceFailureBlockTimestamp'],
                'Cross-chain observed block timestamps do not show prior authorization')
    except (KeyError, TypeError):
        errors.append('Public observed authorization/source timestamps missing')
    timing = get(run, 'proofVerification.timing', {}) or {}
    wait_seconds = verified_seconds = None
    try:
        wait_seconds = seconds_between(timing['sourceFailureConfirmedObservedAt'], timing['attestationReadyObservedAt'])
        verified_seconds = seconds_between(timing['sourceFailureConfirmedObservedAt'], timing['nativeVerificationFinishedAt'])
        require(0 <= wait_seconds <= verified_seconds, 'Invalid observation timing order')
        require(abs(wait_seconds * 1000 - timing['sourceFailureToAttestationObservedMs']) < 2,
                'Attestation elapsed value disagrees with observation timestamps')
        require(abs(verified_seconds * 1000 - timing['sourceFailureToNativeVerifiedMs']) < 2,
                'Native verification elapsed value disagrees with observation timestamps')
        require(same(timing['sourceFailureConfirmedObservedAt'], get(run, 'sourceFailure.observedAt')),
                'Timing refers to a different source observation')
    except (KeyError, TypeError, ValueError):
        errors.append('Measured attestation/native timing is incomplete; do not imply instant settlement')
    require(local.get('passed') is True, 'Local negative-test evidence missing; run --refresh-local-tests')
    for path, digest in local.get('sourceSha256', {}).items():
        require((ROOT / path).is_file() and sha(ROOT / path) == digest, 'Local policy evidence is stale: ' + path)
    require(bool(local.get('sourceSha256')), 'Local policy source fingerprints missing')
    if local.get('logFile'):
        log = resolve(local['logFile'])
        require(log.is_file() and sha(log) == local.get('logSha256'), 'Local policy log fingerprint mismatch')
    return errors, {'sourceToAttestationObservedSeconds': wait_seconds,
                    'sourceToNativeVerifiedObservedSeconds': verified_seconds,
                    'boundary': 'Local observation timestamps; not exact protocol publication time. Waiting is cut from edited playback.'}


class Capture:
    def __init__(self, directory, trim):
        self.directory, self.trim = directory.resolve(), float(trim)
        self.manifest = self.directory / 'frames.json'
        frames = read_json(self.manifest)
        if not isinstance(frames, list) or len(frames) < 2:
            raise ValueError(str(directory) + ': need at least two timestamped frames')
        self.timestamps, self.paths = [], []
        for row in frames:
            ts = float(row['timestamp'])
            path = (self.directory / row['file']).resolve()
            if not math.isfinite(ts) or (self.timestamps and ts < self.timestamps[-1]):
                raise ValueError(str(directory) + ': timestamps must be finite and ordered seconds')
            if not path.is_relative_to(self.directory) or path.suffix.lower() not in ('.jpg', '.jpeg') or not path.is_file():
                raise ValueError(str(directory) + ': invalid or missing source frame')
            self.timestamps.append(ts)
            self.paths.append(path)
        self.duration = self.timestamps[-1] - self.timestamps[0]
        if self.duration <= 0 or self.trim < 0 or self.trim >= self.duration:
            raise ValueError(str(directory) + ': invalid capture duration or trim offset')
        self.cache = OrderedDict()

    def at(self, seconds):
        target = self.timestamps[0] + self.trim + seconds
        index = max(0, bisect.bisect_right(self.timestamps, target) - 1)
        path = self.paths[index]
        if path not in self.cache:
            with Image.open(path) as image:
                self.cache[path] = image.convert('RGB')
            while len(self.cache) > 3:
                self.cache.popitem(last=False)
        return self.cache[path].copy(), target > self.timestamps[-1]

    def provenance(self):
        return {'directory': str(self.directory.relative_to(HERE)), 'frameCount': len(self.paths),
                'timestampUnits': 'seconds', 'firstTimestamp': self.timestamps[0], 'lastTimestamp': self.timestamps[-1],
                'recordedSeconds': self.duration, 'trimStartSeconds': self.trim,
                'framesManifestSha256': sha(self.manifest), 'firstFrameSha256': sha(self.paths[0]),
                'lastFrameSha256': sha(self.paths[-1]),
                'resampling': '24 fps previous-frame hold at source timestamps, 1x speed; held ending explicitly labelled'}


class Graphics:
    def __init__(self, config):
        self.config = config
        self.fonts = {}

    def font(self, size, bold=False, mono=False):
        key = size, bold, mono
        if key not in self.fonts:
            path = self.config['fontMono' if mono else 'fontBold' if bold else 'fontRegular']
            self.fonts[key] = ImageFont.truetype(path, size)
        return self.fonts[key]

    def text(self, draw, pos, text, size=24, color=WHITE, bold=False, mono=False):
        draw.text(pos, str(text), font=self.font(size, bold, mono), fill=color)

    def wrap(self, text, width, size=24, bold=False, mono=False):
        font = self.font(size, bold, mono)
        lines, current = [], ''
        for word in str(text).split():
            if font.getlength(word) > width:
                if current:
                    lines.append(current)
                    current = ''
                chunk = ''
                for char in word:
                    if font.getlength(chunk + char) > width:
                        lines.append(chunk)
                        chunk = ''
                    chunk += char
                current = chunk
            elif font.getlength((current + ' ' + word).strip()) <= width:
                current = (current + ' ' + word).strip()
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines

    def paragraph(self, draw, pos, text, width, size=24, color=WHITE, bold=False, mono=False, max_lines=4):
        lines = self.wrap(text, width, size, bold, mono)
        if len(lines) > max_lines:
            raise ValueError('Text does not fit evidence-card layout: ' + str(text))
        x, y = pos
        for line in lines:
            self.text(draw, (x, y), line, size, color, bold, mono)
            y += size + 7
        return y

    def card(self, title, label='EVIDENCE SUMMARY', subtitle=''):
        image = Image.new('RGB', (1280, 720), BG)
        draw = ImageDraw.Draw(image)
        draw.rounded_rectangle((40, 100, 1240, 568), radius=20, fill=PANEL, outline=LINE, width=2)
        draw.rectangle((40, 100, 48, 568), fill=GREEN)
        self.text(draw, (72, 116), label, 18, GREEN, True)
        self.text(draw, (72, 146), title, 38, WHITE, True)
        if subtitle:
            self.paragraph(draw, (74, 200), subtitle, 1130, 21, MUTED, max_lines=2)
        return image, draw

    def row(self, draw, x, y, label, value, width=530, mono=False, value_size=22):
        self.text(draw, (x, y), label.upper(), 15, MUTED, True)
        self.paragraph(draw, (x, y+24), value if value is not None else 'PENDING', width, value_size,
                       WHITE, mono=mono, max_lines=2)

    def cards(self, run, timing, local, preview=False):
        t = get(run, 'ticket.ticket', {}) or {}
        cards = {}
        image, d = self.card('Authorized before the source action', subtitle='Exact intent. Bounded claim window. Fixed sponsor subsidy - not a full gas refund.')
        self.row(d, 74, 247, 'Source sender / beneficiary', t.get('sourceSender'), mono=True, value_size=18)
        self.row(d, 663, 247, 'Source target', t.get('sourceTarget'), mono=True, value_size=18)
        self.row(d, 74, 329, 'Nonce / minimum gas limit', f"{t.get('sourceNonce', 'PENDING')} / {t.get('minGasLimit', 'PENDING')}")
        self.row(d, 663, 329, 'Eligible source blocks', f"{t.get('minSourceBlock', 'PENDING')} - {t.get('maxSourceBlock', 'PENDING')}")
        self.row(d, 74, 411, 'Fixed gross subsidy', ctc(t.get('rebate')) + ' test CTC', value_size=29)
        self.row(d, 663, 411, 'Exact calldata hash', t.get('calldataHash'), mono=True, value_size=16)
        self.text(d, (74, 509), 'Ticket: ' + str(run.get('ticketId') or 'PENDING'), 17, MUTED, mono=True)
        cards['02-sponsor-ticket'] = image

        s = get(run, 'sourceFailure', {}) or {}
        image, d = self.card('A deliberate, reproducible revert', subtitle='Ethereum Sepolia receipt. Failure proves the outcome; it does not establish fault or damages.')
        self.row(d, 74, 256, 'Receipt status', '0 - FAILED' if get(s, 'receipt.status') == 0 else 'PENDING', value_size=34)
        self.row(d, 663, 256, 'Source block / gas used', f"{get(s, 'receipt.blockNumber', 'PENDING')} / {get(s, 'receipt.gasUsed', 'PENDING')}")
        self.row(d, 74, 355, 'Source transaction', run.get('sourceTxHash'), width=1120, mono=True, value_size=21)
        self.row(d, 74, 445, 'Source contract', s.get('target'), width=1120, mono=True, value_size=21)
        cards['03-source-failure'] = image

        image, d = self.card('Rejection checks, with clear boundaries', label='EVIDENCE SUMMARY / LOCAL POLICY TESTS',
                             subtitle='Read-only checks and local tests are distinct from mined payment transactions.')
        self.row(d, 74, 248, 'Recorded testnet / read-only eth_call',
                 'Duplicate claim: TicketAlreadyClaimed' if run.get('duplicateRejected') else 'Duplicate claim: PENDING', width=1120, value_size=26)
        self.row(d, 74, 332, 'Recorded testnet / native verifier eth_call',
                 'Altered receipt status: rejected' if get(run, 'proofVerification.tamperRejected') else 'Altered receipt status: PENDING', width=1120, value_size=25)
        self.row(d, 74, 416, 'LOCAL POLICY TESTS / mock verifier',
                 'Successful source receipt and altered payload: rejected' if local.get('passed') else 'Local rejection evidence: PENDING', width=1120, value_size=25)
        self.text(d, (74, 514), 'No second payout. These rejection checks did not send extra testnet transactions.', 20, MUTED)
        cards['06-rejection-checks'] = image

        image, d = self.card('Every step is inspectable', subtitle='Source, proof, ticket and payment evidence. Test assets only.')
        self.row(d, 74, 250, 'Gross sponsor subsidy', ctc(run.get('rebateWei')) + ' test CTC', value_size=34)
        self.row(d, 663, 250, 'Observed source to native verification',
                 elapsed_label(timing.get('sourceToNativeVerifiedObservedSeconds')), value_size=27)
        self.row(d, 74, 349, 'Public app', self.config['appUrl'], width=1120, value_size=23)
        self.row(d, 74, 429, 'Source and reproducible evidence', self.config['repositoryUrl'], width=1120, value_size=23)
        self.text(d, (74, 513), 'Fixed subsidy, not full gas reimbursement. Edited playback omits measured waiting.', 20, MUTED)
        cards['07-close'] = image
        if preview:
            for card in cards.values():
                dd = ImageDraw.Draw(card)
                dd.rectangle((0, 0, 1280, 65), fill='#5c410a')
                self.text(dd, (32, 18), 'DRAFT LAYOUT PREVIEW - INCOMPLETE RUN - NOT FOR PUBLICATION', 24, '#ffffff', True)
        return cards

    def decorate(self, image, subtitle, scene, timing, held=False, receipt=None):
        image = image.convert('RGBA')
        overlay = Image.new('RGBA', image.size)
        d = ImageDraw.Draw(overlay)
        d.rectangle((0, 0, 1280, 76), fill=(5, 13, 8, 235))
        self.text(d, (30, 17), 'GASBACK', 28, GREEN, True)
        self.text(d, (818, 13), 'RECORDED TESTNET RUN', 19, WHITE, True)
        self.text(d, (818, 40), 'edited playback' + (' / HELD FRAME' if held else ''), 18, MUTED)
        if scene == '04-native-verification':
            d.rounded_rectangle((28, 86, 1252, 162), radius=10, fill=(4, 16, 8, 242), outline=GREEN)
            wait = elapsed_label(timing.get('sourceToAttestationObservedSeconds'))
            native = elapsed_label(timing.get('sourceToNativeVerifiedObservedSeconds'))
            self.text(d, (45, 95), 'Observed after source failure: attestation ready ' + wait + ' / native verified ' + native, 22, GREEN, True)
            self.text(d, (45, 129), 'Local observations; waiting is cut. This screen is recorded replay, not instant settlement.', 19, MUTED)
        if scene == '05-fixed-payment' and receipt:
            d.rounded_rectangle((28, 86, 1252, 190), radius=10, fill=(4, 16, 8, 242), outline=GREEN)
            self.text(d, (45, 94), 'EVIDENCE SUMMARY / CREDITCOIN MINED CLAIM RECEIPT', 17, GREEN, True)
            self.text(d, (45, 121), 'Status: ' + str(get(receipt, 'receipt.status')) + ' / RebatePaid: ' + ctc(receipt.get('amount')) + ' test CTC', 23, WHITE, True)
            self.text(d, (45, 158), str(get(receipt, 'receipt.transactionHash')), 17, MUTED, mono=True)
        d.rectangle((0, 590, 1280, 720), fill=(3, 9, 5, 245))
        if subtitle:
            lines = self.wrap(subtitle, 1160, 29)
            if len(lines) > 3:
                raise ValueError('Subtitle requires more than three lines; split it in subtitles.json')
            y = 603 + (3 - len(lines)) * 12
            for line in lines:
                width = self.font(29).getlength(line)
                self.text(d, ((1280-width)/2, y), line, 29)
                y += 34
        return Image.alpha_composite(image, overlay).convert('RGB')


def make_subtitles(narration, metadata):
    """Exact paragraph anchors; sentence intervals are editable word-weight estimates."""
    rows = []
    for text, timing in zip(narration['segments'], metadata['segments']):
        sentences = re.split(r'(?<=[.!?])\s+', text['text'].strip())
        weights = [len(sentence.split()) for sentence in sentences]
        start, end = timing['startSeconds'], timing['endSeconds']
        cursor = start
        for index, (sentence, weight) in enumerate(zip(sentences, weights)):
            stop = end if index == len(sentences)-1 else cursor + (end-start)*weight/sum(weights)
            rows.append({'segment': text['id'], 'startSeconds': round(cursor, 3), 'endSeconds': round(stop, 3), 'text': sentence})
            cursor = stop
    return {'timingMethod': 'Exact SAPI paragraph anchors; sentence timings estimated by word count. Editable, not word-aligned recognition.',
            'narrationSha256': sha(resolve(CONFIG['narration'])), 'rows': rows}


def srt_time(seconds):
    ms = round(seconds * 1000)
    hours, ms = divmod(ms, 3600000)
    minutes, ms = divmod(ms, 60000)
    seconds, ms = divmod(ms, 1000)
    return f'{hours:02}:{minutes:02}:{seconds:02},{ms:03}'


def prepare(config):
    errors = []
    values = {}
    for key in ['run', 'publicReverification', 'localPolicyEvidence', 'narration', 'narrationMetadata']:
        path = resolve(config[key])
        try:
            values[key] = read_json(path)
        except (OSError, ValueError) as error:
            values[key] = {}
            errors.append(f'{key}: {error}')
    run, public, local = values['run'], values['publicReverification'], values['localPolicyEvidence']
    evidence_errors, timing = validate_evidence(run, public, local)
    errors.extend(evidence_errors)
    metadata, narration = values['narrationMetadata'], values['narration']
    if [r.get('id') for r in metadata.get('segments', [])] != IDS or [r.get('id') for r in narration.get('segments', [])] != IDS:
        errors.append('Narration must contain the seven expected segments in order')
    audio = resolve(metadata.get('audioFile', 'missing.wav'))
    try:
        with wave.open(str(audio), 'rb') as wav:
            if (wav.getframerate(), wav.getsampwidth(), wav.getnchannels(), wav.getnframes()) != (48000, 2, 1, 5280000):
                errors.append('Narration must be a 110-second 48 kHz 16-bit mono WAV')
        if sha(audio).lower() != str(metadata.get('sha256')).lower():
            errors.append('Narration checksum differs from timing metadata')
    except (OSError, wave.Error) as error:
        errors.append('Narration WAV missing/invalid: ' + str(error))
    if (config['width'], config['height'], config['fps'], config['durationSeconds']) != (1280, 720, 24, 110):
        errors.append('This layout requires 1280x720, 24 fps and 110 seconds')
    for key in ['fontRegular', 'fontBold', 'fontMono']:
        if not Path(config[key]).is_file():
            errors.append(key + ' not found')
    for command in ['ffmpeg', 'ffprobe']:
        if not shutil.which(command):
            errors.append(command + ' not found on PATH')
    captures = {}
    for scene, options in config['recordings'].items():
        try:
            captures[scene] = Capture(resolve(config['captureRoot']) / options['directory'], options.get('trimStartSeconds', 0))
        except (OSError, ValueError, KeyError) as error:
            errors.append(scene + ': ' + str(error))
    if set(config['recordings']) != {'01-introduction', '04-native-verification', '05-fixed-payment'}:
        errors.append('The three required actual recordings must be supplied; no summary-card substitution is allowed')
    return values, timing, audio, captures, errors


def build(config, values, timing, audio, captures, reset_subtitles=False):
    output = inside_output(resolve(config['output']))
    if output.exists():
        raise ValueError('Output already exists; choose a new output name in assembly.json to preserve the existing version')
    graphics = Graphics(config)
    cards = graphics.cards(values['run'], timing, values['localPolicyEvidence'])
    work = HERE / 'work'
    work.mkdir(exist_ok=True)
    for scene, card in cards.items():
        card.save(work / (scene + '.png'))
    metadata, narration = values['narrationMetadata'], values['narration']
    sub_path = HERE / 'subtitles.json'
    if reset_subtitles or not sub_path.exists():
        write_json(sub_path, make_subtitles(narration, metadata))
    subtitles = read_json(sub_path)
    if subtitles['narrationSha256'] != sha(resolve(config['narration'])):
        raise ValueError('Subtitles refer to old narration; regenerate with --reset-subtitles')
    rows = subtitles['rows']
    for index, row in enumerate(rows):
        if not 0 <= row['startSeconds'] < row['endSeconds'] <= 110 or (index and row['startSeconds'] < rows[index-1]['endSeconds']):
            raise ValueError('Subtitle intervals must be ordered, non-overlapping, within 110 seconds')
    srt = '\n\n'.join(f"{i+1}\n{srt_time(r['startSeconds'])} --> {srt_time(r['endSeconds'])}\n{r['text']}" for i, r in enumerate(rows)) + '\n'
    (HERE / 'subtitles.srt').write_text(srt, encoding='utf-8')
    start_times = [item['startSeconds'] for item in metadata['segments']]
    sub_starts = [item['startSeconds'] for item in rows]
    partial = inside_output(output.with_name(output.stem + '.rendering.mp4'))
    if partial.exists():
        raise ValueError('A prior .rendering.mp4 exists; move it aside before rebuilding')
    args = ['ffmpeg', '-hide_banner', '-loglevel', 'warning', '-n', '-f', 'rawvideo', '-pixel_format', 'rgb24',
            '-video_size', '1280x720', '-framerate', '24', '-i', 'pipe:0', '-i', str(audio),
            '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
            '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
            '-t', '110', '-movflags', '+faststart', str(partial)]
    with (work / 'ffmpeg-render.log').open('wb') as log:
        process = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=log)
        try:
            for frame in range(2640):
                time = frame / 24
                index = max(0, bisect.bisect_right(start_times, time) - 1)
                scene = IDS[index]
                held = False
                if scene in captures:
                    image, held = captures[scene].at(time-start_times[index])
                    if image.size != (1280, 720):
                        # Preserve the whole captured viewport; no crop or distortion.
                        image.thumbnail((1280, 720), Image.Resampling.LANCZOS)
                        canvas = Image.new('RGB', (1280, 720), BG)
                        canvas.paste(image, ((1280-image.width)//2, (720-image.height)//2))
                        image = canvas
                else:
                    image = cards[scene].copy()
                sub_index = bisect.bisect_right(sub_starts, time)-1
                subtitle = rows[sub_index]['text'] if sub_index >= 0 and time < rows[sub_index]['endSeconds'] else ''
                rendered = graphics.decorate(image, subtitle, scene, timing, held, values['run'].get('claim'))
                process.stdin.write(rendered.tobytes())
                if frame in [0, 288, 672, 1025, 1480, 1842, 2195, 2639]:
                    rendered.save(work / f'QC-{frame:04}.jpg', quality=92)
                if frame % 240 == 0:
                    print(f'Rendering {frame/24:.0f}/110 seconds', flush=True)
            process.stdin.close()
            if process.wait() != 0:
                raise ValueError('FFmpeg failed; inspect work/ffmpeg-render.log')
        except BaseException:
            if process.poll() is None:
                process.terminate()
                process.wait(timeout=15)
            raise
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(partial)], text=True))
    video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    audio_stream = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
    if video['codec_name'] != 'h264' or audio_stream['codec_name'] != 'aac' or (video['width'], video['height']) != (1280, 720) or abs(float(probe['format']['duration'])-110) > .05:
        raise ValueError('Export format/duration validation failed; provisional file retained')
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(partial), '-f', 'null', '-'], check=True,
                   stdout=subprocess.DEVNULL, timeout=120)
    partial.rename(output)
    report = {'createdAt': utc_now(), 'output': output.name, 'outputSha256': sha(output), 'evidenceGatesPassed': True,
              'durationSeconds': float(probe['format']['duration']), 'videoCodec': video['codec_name'],
              'audioCodec': audio_stream['codec_name'], 'frameRate': video['avg_frame_rate'],
              'frameCount': video.get('nb_frames'), 'dimensions': [1280, 720], 'timing': timing,
              'evidence': {key: {'file': config[key], 'sha256': sha(resolve(config[key]))} for key in
                           ['run', 'publicReverification', 'localPolicyEvidence', 'narration', 'narrationMetadata']},
              'audioSha256': sha(audio), 'subtitlesSha256': sha(sub_path),
              'sourceTxHash': values['run']['sourceTxHash'], 'claimTxHash': values['run']['claimTxHash'],
              'recordings': {scene: capture.provenance() for scene, capture in captures.items()},
              'validation': 'Evidence gates, format and full decode passed. Human full playback/picture-to-narration review still required.',
              'publication': 'Local assembly only; no upload or publication performed.'}
    write_json(HERE / (output.stem + '.manifest.json'), report)
    print(json.dumps({'output': str(output), 'durationSeconds': report['durationSeconds'], 'sha256': report['outputSha256']}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--build', action='store_true', help='Build only when every evidence and input gate passes')
    parser.add_argument('--check', action='store_true', help='Validate inputs and report blockers, without producing MP4')
    parser.add_argument('--preview-cards', action='store_true', help='Write marked draft PNGs only; never produces a success video')
    parser.add_argument('--refresh-local-tests', action='store_true', help='Run two local EVM policy tests and save their evidence under video/')
    parser.add_argument('--reset-subtitles', action='store_true', help='Regenerate sentence estimates when building; replaces editable subtitles.json')
    args = parser.parse_args()
    global CONFIG
    CONFIG = read_json(HERE / 'assembly.json')
    if args.refresh_local_tests:
        local_policy_run()
    values, timing, audio, captures, errors = prepare(CONFIG)
    report = {'checkedAt': utc_now(), 'readyToBuild': not errors, 'blockers': errors,
              'availableRecordings': {k: v.provenance() for k, v in captures.items()}, 'timing': timing,
              'finalVideoProduced': False}
    write_json(HERE / 'assembly-preflight.json', report)
    if args.preview_cards:
        out = HERE / 'layout-preview'
        out.mkdir(exist_ok=True)
        graphics = Graphics(CONFIG)
        for scene, image in graphics.cards(values['run'], timing, values['localPolicyEvidence'], preview=True).items():
            image.save(out / (scene + '-DRAFT.png'))
        print('Marked draft evidence-card PNGs written to layout-preview/. No MP4 produced.')
    if errors:
        print(json.dumps(report, indent=2))
        return 2
    if args.build:
        build(CONFIG, values, timing, audio, captures, args.reset_subtitles)
    else:
        print(json.dumps(report, indent=2))
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print('Assembly stopped: ' + str(error), file=sys.stderr)
        raise SystemExit(1)
