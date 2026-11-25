const int led = 2;
unsigned long changedAt = 0;
bool on = false;

void setup() {
  pinMode(2, OUTPUT);
  digitalWrite(2, LOW);
}

void loop() {
  unsigned long now = millis();
  unsigned long period = on ? 250 : 750;
  if (now - changedAt >= period) {
    on = !on;
    digitalWrite(2, on ? HIGH : LOW);
    changedAt = now;
  }
}
