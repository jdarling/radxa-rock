/*
lib.GPIO.mapToRegister[lib.CONST.J12_P37]
*/

var GPIO = require('../build/Release/gpio');
var CONST = require('./gpio_defines');

var GPIO_CONST={
  HIGH: 1,
  LOW: 0,
  INPUT: 1,
  OUTPUT: 0,
  PULLUP: 0,
  PULLDOWN: 1,

  RK_GPIO0: 0,
  RK_GPIO1: 1,
  RK_GPIO2: 2,
  RK_GPIO3: 3,
  RK_GPIO4: 4,
  RK_GPIO6: 6,
  RK_FUNC_GPIO: 0,
  RK_FUNC_1: 1,
  RK_FUNC_2: 2,

  ROCKCHIP_GPIO_INPUT: 1,
  ROCKCHIP_GPIO_OUTPUT: 0,
  ROCKCHIP_PULL_UP: 0,
  ROCKCHIP_PULL_DOWN: 1,

  GPIO_SWPORT_DR: 0x00,
  GPIO_SWPORT_DDR: 0x04,
  GPIO_INTEN: 0x30,
  GPIO_INTMASK: 0x34,
  GPIO_INTTYPE_LEVEL: 0x38,
  GPIO_INT_POLARITY: 0x3c,
  GPIO_INT_STATUS: 0x40,
  GPIO_INT_RAWSTATUS: 0x44,
  GPIO_DEBOUNCE: 0x48,
  GPIO_PORTS_EOI: 0x4c,
  GPIO_EXT_PORT: 0x50,
  GPIO_LS_SYNC: 0x60,
};

Object.keys(GPIO_CONST).forEach(function(key){
  GPIO[key] = GPIO_CONST[key];
});

var bank, port, bit, pin = 0, name;
var portLookup = ['A', 'B', 'C', 'D'];
var reverseLookup = GPIO.mapToRegister = {};
for(bank = 0; bank < 4; bank++){
  for(port = 0; port < 4; port++){
    for(bit = 0; bit < 8; bit++){
      name = 'PIN'+bank+'_P'+portLookup[port]+bit;
      reverseLookup[CONST['RK30_'+name]]=pin;
      GPIO[name] = pin;
      pin++;
    }
  }
}

module.exports = GPIO;
