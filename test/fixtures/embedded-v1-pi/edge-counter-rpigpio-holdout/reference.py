import time

import RPi.GPIO as GPIO

count = 0


def on_edge(channel):
    global count
    count += 1


GPIO.setmode(GPIO.BCM)
GPIO.setup(23, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.add_event_detect(23, GPIO.FALLING, callback=on_edge, bouncetime=200)
try:
    while True:
        time.sleep(1)
        print(count)
finally:
    GPIO.cleanup()
