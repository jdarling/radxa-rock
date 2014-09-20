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

var _read = function(file, callback) {
  if(callback){
    fs.readFile(file, "utf-8", function(err, data) {
      if(err) {
        return callback(err instanceof Error?err:new Error(err));
      }
      callback(null, data);
    });
  }else{
    try{
      return fs.readFileSync(file, "utf-8");
    }catch(e){
      if(!override) {
        console.error('READ ERROR: ', file);
        console.error(e.stack||e);
        throw e;
      }
    }
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

var Rock = function(options){
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
    return _read(path, function(err, dir){
      return callback(null, dir||'undefined');
    });
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
      console.log('Error reading pin, exporting');
      return self.export(pinNumber, function(err){
        if(err){
          console.log('got an error exporting: ', err);
          return callback(err);
        }
        return _write(path, dir, callback);
      });
    }
    if(dir.indexOf(direction)===-1){
      return _write(path, dir, callback);
    }
    return process.nextTick(callback||NOOP);
  });
};

Rock.prototype.get = Rock.prototype.read = function(pinNumber, callback){
  var self = this;
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/value';
  return _read(path, callback);
};

Rock.prototype.set = Rock.prototype.write = function(pinNumber, value, callback){
  var self = this;
  var path = GPIO_PATH + 'gpio'+ pinNumber + '/value';
  return _write(path, value, callback);
};

module.exports = Rock;
