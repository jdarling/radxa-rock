var CONST = require('../../index').CONST;
var Rock = require('../../index').Rock;

var step = function(){
  rock.get(CONST.J15_P38, function(err, val){
    if(err){
      console.error(err.stack||err);
      process.exit(1);
    }
    console.log(val);
    rock.set(CONST.J15_P37, val);
    return process.nextTick(step);
  });
};

var start = function(){
  return process.nextTick(step);
};

var rock = new Rock({
  pins: [
    {
      pin: CONST.J15_P38,
      mode: 'in'
    },
    {
      pin: CONST.J15_P37,
      mode: 'out'
    }
  ]
}, start);
