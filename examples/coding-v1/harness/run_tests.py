# Runs the hidden unittest files next to this script and prints one summary line tagged with the grader's nonce.
# The nonce leaves the environment before any test or candidate module is imported.
import json
import os
import sys
import unittest

nonce = os.environ.pop("GAUNTLET_NONCE", "")
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
suite = unittest.defaultTestLoader.discover(here, pattern="test_*.py", top_level_dir=here)
result = unittest.TestResult()
suite.run(result)
bad = len(result.failures) + len(result.errors) + len(result.skipped) + len(result.unexpectedSuccesses)
summary = {"tests": result.testsRun, "passed": max(0, result.testsRun - bad)}
sys.stdout.write("\nGAUNTLET-RESULT %s %s\n" % (nonce, json.dumps(summary)))
sys.stdout.flush()
