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

Returns the value of pinNumber if the PIN is in input mode.  If the pin is not
in input mode will return an error.

Rock.set(pinNumber, value, [callback])
--------------------------------------

Sets the value of pinNumber to the value specified if the pin is in output mode.
Will return an error if the pin is not in output mode.

Rock.setPinMode(pinNumber, direction, [callback])
-------------------------------------------------



Rock.getPinMode(pinNumber, [callback])
--------------------------------------

Returns the mode the pin is currently in.  One of:

  in - The pin is setup as an input
  out - The pin is setup as an output
  undefined - The pin isn't setup yet

License
=======

The MIT License (MIT)

Copyright (c) 2014 Jeremy Darling

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Pull requests welcome for bug fixes and enhancements!
=====================================================
