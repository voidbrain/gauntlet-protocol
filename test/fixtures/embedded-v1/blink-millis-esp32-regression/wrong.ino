// Compiles, but blocks with delay(); the static checks reject it.
void setup() {
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);
  delay(250);
  digitalWrite(2, LOW);
  delay(750);
}
