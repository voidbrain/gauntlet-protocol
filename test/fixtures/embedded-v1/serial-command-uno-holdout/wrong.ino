// Compiles, but blocks in readStringUntil(); the static checks reject it.
void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command == "ON") digitalWrite(13, HIGH);
    else if (command == "OFF") digitalWrite(13, LOW);
    else { Serial.println("ERR"); return; }
    Serial.println("OK");
  }
}
