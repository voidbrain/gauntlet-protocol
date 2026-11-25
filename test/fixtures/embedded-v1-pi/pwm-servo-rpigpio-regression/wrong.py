# Board numbering (physical pin 12) instead of BCM 18, and no cleanup in finally.
import time

import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)
GPIO.setup(12, GPIO.OUT)
servo = GPIO.PWM(12, 50)
servo.start(7.5)
duty = 5.0
while duty <= 10.0:
    servo.ChangeDutyCycle(duty)
    time.sleep(0.05)
    duty += 0.5
GPIO.cleanup()
