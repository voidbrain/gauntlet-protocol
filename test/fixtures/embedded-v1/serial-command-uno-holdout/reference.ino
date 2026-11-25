char line[16];
byte length = 0;

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void handle() {
  if (strcmp(line, "ON") == 0) {
    digitalWrite(13, HIGH);
    Serial.println("OK");
  } else if (strcmp(line, "OFF") == 0) {
    digitalWrite(13, LOW);
    Serial.println("OK");
  } else {
    Serial.println("ERR");
  }
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\r') continue;
    if (c == '\n') {
      line[length] = '\0';
      handle();
      length = 0;
    } else if (length < sizeof(line) - 1) {
      line[length++] = c;
    }
  }
}
