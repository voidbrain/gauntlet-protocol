int duty = 0;
int step = 1;
unsigned long steppedAt = 0;

void setup() {
  ledcAttach(4, 5000, 8);
}

void loop() {
  unsigned long now = millis();
  if (now - steppedAt < 10) return;
  steppedAt = now;
  duty += step;
  if (duty <= 0 || duty >= 255) step = -step;
  ledcWrite(4, duty);
}
