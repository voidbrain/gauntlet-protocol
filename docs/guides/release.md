# Releasing a pack

Each pack ships in a tagged release; consumers adopt it by moving their pin to the new tag. The agent prepares the release PR; the owner tags. Run the blocks on the machine that holds `~/Projects/gauntlet-protocol`.

## 1. Ask for the release PR

Send the agent:

```text
Prepare the release of <pack> (<record step, e.g. F-017-T02>): bump package.json to the next minor version, add the CHANGELOG entry naming the new cases, open the PR and land it on green CI.
```

Expected: the agent replies with the merged PR number and the version, for example `0.10.0`.

## 2. Tag and publish

Replace `0.10.0` with the version from step 1.

```bash
cd ~/Projects/gauntlet-protocol
git checkout main && git pull --ff-only
grep '"version"' package.json
git tag -a v0.10.0 -m "Release v0.10.0"
git push origin v0.10.0
gh release create v0.10.0 -R voidbrain/gauntlet-protocol --title v0.10.0 --notes-from-tag
```

Expected: `grep` prints `"version": "0.10.0",`; the push lists `* [new tag] v0.10.0 -> v0.10.0`; `gh` prints the release URL.

## 3. Report

Reply with the tag and the release URL; the agent closes the release step.
