# Python 2 syntax: fails byte-compilation on Python 3.
import time

import RPi.GPIO as GPIO

count = 0
GPIO.setmode(GPIO.BCM)
GPIO.setup(23, GPIO.IN, pull_up_down=GPIO.PUD_UP)
try:
    while True:
        time.sleep(1)
        print count
finally:
    GPIO.cleanup()
