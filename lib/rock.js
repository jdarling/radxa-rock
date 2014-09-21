var fs = require('fs');
var CONST = require('./gpio_defines');

var GPIO_PATH = CONST.GPIO_PATH;
var NOOP = function(){};

var _write = function(file, str, callback, override) {
  if(callback){
    return fs.writeFile(file, str, function(err) {
      if(err && !override) {
        return callback(err instanceof Error?err:new Error(err));
      }
      return callback();
    });
  }
  try{
    return fs.writeFileSync(file, str);
  }catch(e){
    if(!override) {
      console.error('WRITE ERROR: ', file);
      console.error(e.stack||e);
      throw e;
    }
  }
};

var _read = function(file, callback, override) {
  if(callback){
    fs.readFile(file, "utf-8", function(err, data) {
      if(err) {
        return callback(err instanceof Error?err:new Error(err));
      }
      callback(null, data.trim());
    });
  }else{
    return (fs.readFileSync(file, "utf-8")||'').trim();
  }
};

var _unexport = function(pinNumber, callback) {
  return _write(GPIO_PATH + 'unexport', pinNumber, callback, true);
};

var _export = function(pinNumber, callback) {
  if(fs.existsSync(GPIO_PATH + 'gpio'+pinNumber)){
    return _unexport(pinNumber, function(){
      return _export(pinNumber, callback);
    });
  }
  return _write(GPIO_PATH + 'export', pinNumber, function(err){
    if(err){
      return _unexport(pinNumber, function(){
        return _export(pinNumber, callback);
      });
    }
    return (callback||NOOP)();
  }, 1);
};

var Rock = function(options, callback){
  var self = this;
  if(typeof(options)==='function'){
    return options(null, self);
  }
  var pins = (options||{}).pins||[];
  var toSet = pins.length;
  var errors = [];
  var done = function(){
    (callback||NOOP)(errors.length?errors:null, self);
  };
  var next = function(err){
    toSet--;
    if(err){
      errors.push(err);
    }
    if(toSet<=0){
      return done();
    }
  };
  if(pins.length===0){
    return done();
  }
  pins.forEach(function(info){
    self.setPinMode(info.pinNumber||info.pin, info.mode, next);
  });
};

Rock.prototype.export = function(pinNumber, callback){
  _export(pinNumber, callback);
};

Rock.prototype.unexport = function(pinNumber, callback){
  _unexport(pinNumber, callback);
};

Rock.prototype.getPinMode = function(pinNumber, callback){
  var self = this;
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/direction';
  try{
    if(callback){
      return _read(path, function(err, dir){
        return callback(null, (dir||'undefined').trim());
      });
    }
    return _read(path);
  }catch(e){
    return 'undefined';
  }
};

Rock.prototype.setPinMode = function(pinNumber, direction, callback){
  var self = this;
  var mode = direction === 'in' || direction === 'input' ? 'in':'out';
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/direction';
  _read(path, function(err, dir){
    if(err){
      return self.export(pinNumber, function(err){
        if(err){
          return callback(err);
        }
        return _write(path, mode, callback);
      });
    }
    if(dir.indexOf(mode)===-1){
      return _write(path, mode, callback);
    }
    return process.nextTick(callback||NOOP);
  });
};

Rock.prototype.pinMode = function(pinNumber, mode, callback){
  var self = this;
  if(typeof(mode)==='function' || typeof(mode) === 'undefined'){
    return self.getPinMode(pinNumber, mode||callback);
  }
  return self.setPinMode(pinNumber, mode, callback);
};

Rock.prototype.get = function(pinNumber, callback){
  var self = this;
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/value';
  return _read(path, callback);
};

Rock.prototype.set = function(pinNumber, value, callback){
  var self = this;
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/value';
  return _write(path, value, callback);
};

module.exports = Rock;
