var CONST = require('radxa-rock').CONST;
var Rock = require('radxa-rock').Rock;

var rock = new Rock();

rock.setPinMode(CONST.J15_P37, 'out', function(){
  var status = 0;
  var toggle = function(){
    status = status?0:1;
    rock.set(CONST.J15_P37, status);

    setTimeout(toggle, 500);
  };
  toggle();
});
