const rpio = require('rpio');

rpio.open(7, rpio.OUTPUT, rpio.LOW);
rpio.write(7, rpio.LOW);
rpio.sleep(4);
rpio.write(7, rpio.HIGH);
