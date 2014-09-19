Radxa Rock
==========

This is a library for interfacing with the Radxa Rock's () GPIO.

It is still WAY in development.

Currently examples/blink/blink.js will toggle GPIO 198 on and off for 500ms.  If
you connect an LED from Pin 37(-) to 39(+) with a resistor you will see the LED
blink on and off.  You could also connect from pin 37(+) with a resistor to
pin 40(-) and see the LED alternate on and off opposite the 37/38 connection.

See the reference/ folder for reference images and the led.sh file that started
it all.

API
===

General
-------

Anytime there is a [callback] it is optional.  If you leave it out then return
values will be returned in a sync manor.  Using the callback may lead to
performance improvements though so you should always use the callback if you can.

All [callback]'s function the exact same, they return as:

callback(err, value)

Where err is any error that occurred and if there was no error then value is
present.

radxa-rock.CONST
----------------

Contains a hash with common PIN names and number already assigned for you.  See
examples/blink/blink.js for a readable example.

radxa-rock.Rock()
-----------------

The constructor for a new Rock object.  You should only need one for your entire
application.

Rock.get(pinNumber, [callback])
-------------------------------

Rock.set(pinNumber, value, [callback])
--------------------------------------

Rock.setPinMode(pinNumber, direction, [callback])
-------------------------------------------------

Rock.getPinMode(pinNumber, [callback])
--------------------------------------

License
=======

MIT

Pull requests welcome for bug fixes and enhancements!
=====================================================
