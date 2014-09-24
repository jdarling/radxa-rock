var CONST = require('../../../index').CONST;
var gpioAvailable = (function(){
  var fs = require('fs');
  return fs.existsSync(CONST.GPIO_PATH);
})();

var Rock = require('../../../index').Rock;
module.exports = new Rock();

if(!gpioAvailable){
  console.error('\x1B[31mERROR:\x1B[39m '+CONST.GPIO_PATH+' is not available!');
}
