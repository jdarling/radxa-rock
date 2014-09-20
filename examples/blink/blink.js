var CONST = require('../../index').CONST;
var Rock = require('../../index').Rock;

var rock = new Rock();

rock.setPinMode(CONST.J15_P37, 'out', function(err){
  var status = 0;
  var toggle = function(){
    status = status?0:1;
    rock.set(CONST.J15_P37, status);

    setTimeout(toggle, 500);
  };
  if(err){
    console.log(err.stack || err);
    return process.exit(1);
  }
  toggle();
});
