# Polls the button in a loop that never blocks.
from gpiozero import LED, Button

led = LED(27)
button = Button(2, bounce_time=0.05)
was_pressed = False
while True:
    pressed = button.is_pressed
    if pressed and not was_pressed:
        led.toggle()
    was_pressed = pressed
