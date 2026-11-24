# Runs inside the candidate's sandbox. It holds no reference answers: it calls the candidate's function on each input
# from inputs.json and writes what came back (or the error raised) to results.json. Everything here is
# candidate-controlled once the candidate is imported; the grader outside compares the results.
import json
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
with open(os.path.join(here, "inputs.json"), encoding="utf-8") as source:
    spec = json.load(source)


def failure(error):
    return {"error": [kind.__name__ for kind in type(error).__mro__], "message": str(error)[:200]}


try:
    import solution

    function = getattr(solution, spec["function"])
    loaded = None
except BaseException as error:
    loaded = failure(error)

results = []
for args in spec["inputs"]:
    if loaded:
        results.append(loaded)
        continue
    try:
        value = function(*args)
        json.dumps(value)
        results.append({"ok": value})
    except Exception as error:
        results.append(failure(error))
with open(os.path.join(here, "results.json"), "w", encoding="utf-8") as target:
    json.dump(results, target)
