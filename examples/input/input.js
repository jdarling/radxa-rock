var CONST = require('../../index').CONST;
var Rock = require('../../index').Rock;

var pinVal = 0;

var step = function(){
  rock.get(CONST.J15_P38, function(err, val){
    if(err){
      console.error(err.stack||err);
      process.exit(1);
    }
    val = parseInt(val)||0;
    if(val!==pinVal){
      return rock.set(CONST.J15_P37, val, function(){
        pinVal = val;
        return process.nextTick(step);
      });
    }
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
