import time

import RPi.GPIO as GPIO

PIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)
servo = GPIO.PWM(18, 50)
servo.start(7.5)
try:
    duty, step = 5.0, 0.5
    while True:
        servo.ChangeDutyCycle(duty)
        time.sleep(0.05)
        duty += step
        if duty >= 10.0 or duty <= 5.0:
            step = -step
except KeyboardInterrupt:
    pass
finally:
    servo.stop()
    GPIO.cleanup()
