# Static facts about a Raspberry Pi Python candidate for the embedded-v1 grader (F-016-T03).
# Byte-compiles and parses the file named on the command line; never imports or runs it. Prints one JSON object:
# {"syntax": "ok"} plus imports, calls (dotted names with literal arguments), attribute assignments and reads, calls in
# finally blocks and the number of while loops that never block, or {"syntax": "error", "message": ...}.
import ast
import json
import sys

BLOCKING = ("sleep", "pause", "wait", "wait_for_edge", "wait_for_press", "wait_for_release", "wait_for_active",
            "wait_for_inactive", "wait_for_motion", "wait_for_no_motion", "join", "get", "select")


def dotted(node, aliases):
    """Dotted name of a call target: an imported name resolves to its module path; any other receiver is "?"."""
    parts = []
    while isinstance(node, ast.Attribute):
        parts.append(node.attr)
        node = node.value
    if isinstance(node, ast.Name):
        if node.id in aliases:
            return ".".join([aliases[node.id]] + list(reversed(parts)))
        return "?." + parts[0] if parts else node.id
    return "?." + parts[0] if parts else None


def literal(node, aliases):
    try:
        return ast.literal_eval(node)
    except Exception:
        name = dotted(node, aliases)
        return {"name": name} if name else {"expr": type(node).__name__}


def main():
    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as handle:
        source = handle.read()
    try:
        compile(source, "solution.py", "exec", dont_inherit=True)
        tree = ast.parse(source, "solution.py")
    except (SyntaxError, ValueError) as error:
        print(json.dumps({"syntax": "error", "message": "%s: %s" % (type(error).__name__, getattr(error, "msg", error))}))
        return
    aliases = {}
    imports = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for name in node.names:
                imports.append(name.name)
                if name.asname:
                    aliases[name.asname] = name.name
                else:
                    top = name.name.split(".")[0]
                    aliases.setdefault(top, top)
        elif isinstance(node, ast.ImportFrom) and node.module and not node.level:
            imports.append(node.module)
            for name in node.names:
                aliases[name.asname or name.name] = node.module + "." + name.name
    calls = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            name = dotted(node.func, aliases)
            if name is None:
                continue
            calls.append({
                "name": name,
                "args": [literal(arg, aliases) for arg in node.args],
                "kwargs": {kw.arg: literal(kw.value, aliases) for kw in node.keywords if kw.arg},
            })
    assigns = []
    for node in ast.walk(tree):
        targets = node.targets if isinstance(node, ast.Assign) else [node.target] if isinstance(node, (ast.AugAssign, ast.AnnAssign)) else []
        for target in targets:
            if isinstance(target, ast.Attribute):
                assigns.append("?." + target.attr)

    def blocks(nodes):
        stack = list(nodes)
        while stack:
            node = stack.pop()
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda, ast.ClassDef)):
                continue
            if isinstance(node, ast.Await):
                return True
            if isinstance(node, ast.Call):
                name = dotted(node.func, aliases) or ""
                if name.split(".")[-1] in BLOCKING:
                    return True
            stack.extend(ast.iter_child_nodes(node))
        return False

    attributes = sorted({"?." + node.attr for node in ast.walk(tree)
                         if isinstance(node, ast.Attribute) and isinstance(node.ctx, ast.Load)})
    finally_calls = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Try):
            for inner in node.finalbody:
                for sub in ast.walk(inner):
                    if isinstance(sub, ast.Call) and dotted(sub.func, aliases):
                        finally_calls.add(dotted(sub.func, aliases))
    busy = sum(1 for node in ast.walk(tree) if isinstance(node, ast.While) and not blocks(node.body + [node.test]))
    print(json.dumps({"syntax": "ok", "imports": sorted(set(imports)), "calls": calls, "assigns": sorted(set(assigns)), "attributes": attributes,
                      "finallyCalls": sorted(finally_calls), "busyLoops": busy}))


main()
