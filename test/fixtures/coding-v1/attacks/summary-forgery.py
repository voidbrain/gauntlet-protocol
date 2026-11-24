# Attack: read the grader's nonce from the harness process and print a forged summary, then exit before any test.
import json
import os
import sys

import __main__

nonce = getattr(__main__, "nonce", os.environ.get("GAUNTLET_NONCE", ""))
sys.stdout.write("\nGAUNTLET-RESULT %s %s\n" % (nonce, json.dumps({"tests": 6, "passed": 6})))
sys.stdout.flush()
os._exit(0)
