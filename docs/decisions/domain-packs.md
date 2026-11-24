# Domain packs: owner decisions

Design choices the [roadmap](../ROADMAP.md) "Domain packs" milestone needs from the owner. Each section gives the question, the options and a recommendation. Answer by replying with the section name and the option letter; the agent records the answer and its date in the backlog record.

## Coding sandbox

**Question.** Which isolation boundary runs model-written code for the coding reference runner?

Coding cases run code a model wrote and compare what it returns with expected values. PROTOCOL.md requires the runner to supply an enforced boundary; a POSIX process group bounds time and output but is not a sandbox. The boundary must give: no network; writes only to a scratch workspace; wall-time, memory and process-count limits; hidden tests unreadable while the candidate is produced; the grader outside the candidate's control. The runner refuses to run when the boundary is unavailable; it never falls back to running code unsandboxed.

The boundary protects the host; it does not make grading trustworthy on its own. A candidate that shares a process with the tests can patch the test framework or the assertions, whatever the sandbox. So grading stays out of process with every option below: the sandboxed process gets only the candidate, a driver and the inputs, and the grader outside it compares the returned values with expectations it alone holds. Both are required.

| Option | What it is | Gives | Costs |
|---|---|---|---|
| **A. OCI container** (recommended) | One throwaway container per case: `--network none --read-only --tmpfs /work --memory 512m --pids-limit 64 --cpus 1 --cap-drop ALL --security-opt no-new-privileges --user 65534`, from a pinned image digest holding Python 3 and Node 24 | Every limit above, the same on macOS and on Linux CI (GitHub's Ubuntu runners have Docker) | A container engine must run on the evaluation host (Docker Desktop, Colima or Apple `container`); about 150 MB image; container start adds about a second per case |
| **B. macOS sandbox profile** | `sandbox-exec` with a deny-network, write-only-workspace profile, plus `setrlimit` | No engine needed on a Mac | `sandbox-exec` is deprecated; macOS memory limits through `RLIMIT_AS` are unreliable; Linux CI needs a second boundary, so two code paths to keep equal |
| **C. Linux namespaces** | bubblewrap or nsjail with a new network namespace, seccomp and cgroup limits | Light and strong | Linux only: a Mac host would need a Linux VM |
| **D. Interpreter flags only** | Node's permission model, `python3 -I` | Nothing to install | Rejected: neither is a security boundary against hostile code |

**To answer:** reply `Coding sandbox: A` (or B, C), and say which engine the evaluation host will run for A.

**Second question: where do holdout expectations live?** The coding tasks, expected values and reference solutions are public, so a model trained after their publication may have seen them; today the pack says its holdout cases are contamination-exposed.

| Option | Effect |
|---|---|
| **H1. Keep them public** | Simple and reproducible by anyone; the holdout split stays an exposed example and qualification counts it as such |
| **H2. Private holdout store** | Holdout `cases.json` files live outside the public repository (an owner-held directory the runner reads by path); the pack keeps public inputs and a hash of the private expectations so reports stay identifiable. Real holdouts, but only the owner can run or audit them |

No recommendation yet: H2 needs a place and a backup for the private files. **To answer:** reply `Holdout expectations: H1` or `H2`.

## Embedded area

**Question 1.** Where do the Arduino, ESP32 and Raspberry Pi cases sit in the capability index?

| Option | Index entry | Effect |
|---|---|---|
| **A. New core area `embedded`** (recommended) | `embedded: N mapped cases` | Coverage is visible on its own; adds one entry to the area taxonomy in `src/catalog.ts`, a minor protocol release |
| **B. Area `coding`, capability `embedded`** | Counted under `coding` | No taxonomy change; embedded coverage is hidden inside coding totals |
| **C. Extension area `x:<namespace>:embedded`** | Namespaced extension area | No core change; extension areas are meant for consumer-specific areas, not shared packs |

**Question 2.** Which toolchain compiles the sketches in CI?

| Option | Gives | Costs |
|---|---|---|
| **A. arduino-cli with a pinned ESP32 core** (recommended) | One tool for AVR and ESP32 sketches, pinned core version, cacheable in CI | The ESP32 core is a few hundred MB on first install; compile cases are marked costly |
| **B. PlatformIO with a pinned ESP32 platform** | Reproducible project files, many boards | Python tool plus its own package cache; heavier CI setup |

Raspberry Pi cases need neither: they are byte-compiled and checked statically, never executed. Compiling is not executing: the grader controls the build files and the candidate supplies only source.

**To answer:** reply `Embedded area: A` (or B, C) and `Embedded toolchain: A` (or B).
