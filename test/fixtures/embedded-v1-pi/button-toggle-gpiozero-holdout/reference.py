from signal import pause

from gpiozero import LED, Button

led = LED(27)
button = Button(2, bounce_time=0.05)
button.when_pressed = led.toggle
pause()
