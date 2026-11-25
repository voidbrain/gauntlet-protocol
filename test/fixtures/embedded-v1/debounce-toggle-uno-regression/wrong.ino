// Passes the static checks but does not compile: lastChange is never declared.
bool ledOn = false;

void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(13, OUTPUT);
}

void loop() {
  if (digitalRead(2) == LOW && millis() - lastChange > 50) {
    lastChange = millis();
    ledOn = !ledOn;
    digitalWrite(13, ledOn ? HIGH : LOW);
  }
}
