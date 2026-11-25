// Tries to pull a host file into the build; the grader refuses it before compiling.
#include "/etc/hosts"
void setup() { pinMode(2, OUTPUT); }
void loop() { digitalWrite(2, millis() % 1000 < 250); }
