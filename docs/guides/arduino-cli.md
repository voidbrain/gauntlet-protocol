# arduino-cli for the embedded pack

The embedded pack compiles candidate Arduino and ESP32 sketches with arduino-cli and pinned cores; nothing runs on hardware. The evaluation machine (the Mac that runs `gauntlet run` and where the agent develops the pack) needs arduino-cli and both cores. Run every block below in Terminal on that machine.

CI does not install arduino-cli or compile for real (owner decision 2026-11-25: the ESP32 core download is too large per run). CI runs the grader against a stand-in compiler; real compiles run only on this machine, in `test/embedded-grader.test.ts`, which skips where the toolchain is missing.

## 1. Install arduino-cli

```bash
brew install arduino-cli
arduino-cli version
```

Expected: `arduino-cli  Version: 1.x.y ...`.

## 2. Install the pinned cores

```bash
ESP32_URL=https://espressif.github.io/arduino-esp32/package_esp32_index.json
arduino-cli core update-index --additional-urls "$ESP32_URL"
arduino-cli core install arduino:avr@1.8.6
arduino-cli core install esp32:esp32@3.0.7 --additional-urls "$ESP32_URL"
arduino-cli core list
```

Expected: the list shows `arduino:avr` `1.8.6` and `esp32:esp32` `3.0.7`. The ESP32 core downloads a few hundred MB the first time.

## 3. Check a compile

```bash
mkdir -p ~/arduino-check/Blink
printf 'void setup() { pinMode(2, OUTPUT); }\nvoid loop() { digitalWrite(2, HIGH); delay(500); digitalWrite(2, LOW); delay(500); }\n' > ~/arduino-check/Blink/Blink.ino
arduino-cli compile --fqbn arduino:avr:uno ~/arduino-check/Blink
arduino-cli compile --fqbn esp32:esp32:esp32 ~/arduino-check/Blink
```

Expected: each compile ends with `Sketch uses ... bytes` and no `Error`. Remove the check folder afterwards with `rm -r ~/arduino-check`.

## 4. Report

Reply with the `arduino-cli core list` output and whether both compiles succeeded.
