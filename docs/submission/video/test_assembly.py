"""Checks that final-assembly gates fail closed and capture resampling is timestamp-based."""
from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('assembly', HERE / 'assemble.py')
assembly = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assembly)


class AssemblyChecks(unittest.TestCase):
    def test_missing_payment_blocks_final(self):
        errors, _ = assembly.validate_evidence({'status': 'source-failed-awaiting-attestation'}, {}, {})
        self.assertIn('run.status is not completed-live-testnet-rebate', errors)
        self.assertIn('claim.receipt.status mismatch or missing', errors)

    def test_public_identity_mismatch_blocks_final(self):
        config = assembly.read_json(HERE / 'assembly.json')
        run = assembly.read_json(assembly.resolve(config['run']))
        public_path = assembly.resolve(config['publicReverification'])
        if not public_path.exists():
            self.skipTest('Real public reverification does not exist yet')
        public = assembly.read_json(public_path)
        changed = deepcopy(public)
        changed['claimTxHash'] = '0x' + '00' * 32
        errors, _ = assembly.validate_evidence(run, changed, {})
        self.assertIn('Public reverification claimTxHash differs from run', errors)

    def test_source_status_and_claim_payee_mutations_block(self):
        config = assembly.read_json(HERE / 'assembly.json')
        run = assembly.read_json(assembly.resolve(config['run']))
        run['sourceFailure']['receipt']['status'] = 1
        run.setdefault('claim', {})
        if run['claim'] is None:
            run['claim'] = {}
        run['claim']['beneficiary'] = '0x' + '00' * 20
        errors, _ = assembly.validate_evidence(run, {}, {})
        self.assertIn('sourceFailure.receipt.status mismatch or missing', errors)
        self.assertIn('claim.beneficiary identity mismatch', errors)

    def test_capture_uses_elapsed_timestamp_not_frame_index(self):
        work = HERE / 'work'
        work.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='assembly-check-', dir=work) as folder:
            path = Path(folder)
            Image.new('RGB', (2, 2), 'red').save(path / 'a.jpg')
            Image.new('RGB', (2, 2), 'blue').save(path / 'b.jpg')
            (path / 'frames.json').write_text(json.dumps([
                {'file': 'a.jpg', 'timestamp': 100}, {'file': 'b.jpg', 'timestamp': 103}
            ]), encoding='utf-8')
            capture = assembly.Capture(path, 0)
            image, held = capture.at(2)
            self.assertGreater(image.getpixel((0, 0))[0], 200)
            self.assertFalse(held)
            image, held = capture.at(4)
            self.assertGreater(image.getpixel((0, 0))[2], 200)
            self.assertTrue(held)


if __name__ == '__main__':
    unittest.main()
