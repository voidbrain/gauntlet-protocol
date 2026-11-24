# Container engine for the coding runner

The coding reference runner runs model-written code in one throwaway container per case. The evaluation machine (the Mac that runs `gauntlet run`) needs a running container engine with the `docker` command. Run every block below in Terminal on that machine.

## 1. Start an engine (pick one)

**Docker Desktop** (already installed on the machine):

```bash
open -a Docker
until docker info >/dev/null 2>&1; do sleep 2; done; docker version --format '{{.Server.Version}}'
```

Expected: a version number such as `28.3.2` after Docker Desktop finishes starting.

**colima** (a CLI engine, no desktop app; needs Homebrew):

```bash
brew install colima docker
colima start --cpu 2 --memory 4
docker context use colima
docker version --format '{{.Server.Version}}'
```

Expected: `colima start` ends with `done`, and the last command prints a version number.

## 2. Check the limits the runner relies on

```bash
docker run --rm --network none alpine true && echo OK
```

Expected: `OK` (the first run downloads the small `alpine` image).

```bash
docker run --rm --network none alpine wget -q -T 3 -O /dev/null https://example.com && echo REACHABLE || echo BLOCKED
```

Expected: `BLOCKED`.

```bash
docker run --rm --memory 64m --memory-swap 64m alpine sh -c 'head -c 200m /dev/zero | tail'; echo "exit $?"
```

Expected: `exit 137` (the container was killed at its memory limit).

## 3. Report

Reply with the three outputs from step 2 and which engine you started. The engine has to be running whenever coding cases run; the runner refuses to start without it.
