# Spins the CPU toggling the LED instead of using blink() and pause().
from gpiozero import LED

led = LED(17)
while True:
    led.toggle()
