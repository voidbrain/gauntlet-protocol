const unsigned long debounceMs = 50;
int stable = HIGH;
int lastReading = HIGH;
unsigned long changedAt = 0;
bool ledOn = false;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  int reading = digitalRead(2);
  if (reading != lastReading) {
    changedAt = millis();
    lastReading = reading;
  }
  if (millis() - changedAt >= debounceMs && reading != stable) {
    stable = reading;
    if (stable == LOW) {
      ledOn = !ledOn;
      digitalWrite(13, ledOn ? HIGH : LOW);
    }
  }
}
