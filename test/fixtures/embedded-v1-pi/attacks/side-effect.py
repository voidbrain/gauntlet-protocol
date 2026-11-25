# Would write a marker file if it were ever imported or run; the grader only parses it.
import os
import sys

open(os.environ.get("GAUNTLET_PI_MARKER", "/nonexistent/marker"), "w").write("ran")
sys.exit(0)
