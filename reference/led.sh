#!/bin/sh

PIN_NUMBER=198

echo $PIN_NUMBER > /sys/class/gpio/export

# set the direction to output
echo "out" > "/sys/class/gpio/gpio"$PIN_NUMBER"/direction"
while true;
do
echo 0 > "/sys/class/gpio/gpio"$PIN_NUMBER"/value" #led on
sleep 1
echo 1 > "/sys/class/gpio/gpio"$PIN_NUMBER"/value" #led off
sleep 1
done
