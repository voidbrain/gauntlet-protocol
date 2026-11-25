// The Arduino-ESP32 2.x LEDC API: removed in core 3.x, so it does not compile on the pinned core.
const int channel = 0;
int duty = 0;
int step = 1;
unsigned long steppedAt = 0;

void setup() {
  ledcSetup(channel, 5000, 8);
  ledcAttachPin(4, channel);
}

void loop() {
  if (millis() - steppedAt < 10) return;
  steppedAt = millis();
  duty += step;
  if (duty <= 0 || duty >= 255) step = -step;
  ledcWrite(channel, duty);
}
