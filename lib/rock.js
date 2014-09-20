var fs = require('fs');
var CONST = require('./gpio_defines');

var GPIO_PATH = CONST.GPIO_PATH;
var NOOP = function(){};

var _write = function(file, str, callback, override) {
	if(typeof callback === "function"){
    fs.writeFile(file, str, function(err) {
      if(err && !override) {
        console.error('WRITE ERROR: ', file);
        console.error(err.stack||err);
        return callback(err);
      }
      callback();
    });
  }else{
    try{
      fs.writeFileSync(file, str);
    }catch(e){
      if(!override) {
        console.error('WRITE ERROR: ', file);
        console.error(e.stack||e);
        throw e;
      }
    }
  }
};

var _read = function(file, callback) {
	if(typeof callback === "function"){
    fs.readFile(file, "utf-8", function(err, data) {
      if(err) {
        console.error('READ ERROR: ', file);
        console.error(err.stack||err);
        return callback(err);
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

var _unexport = function(number, callback) {
	_write(GPIO_PATH + 'unexport', number, callback, true);
};

var _export = function(n, callback) {
	if(exists(GPIO_PATH + 'gpio'+n)) {
		_unexport(n, function() { _export(n, callback); });
	} else {
		_write(GPIO_PATH + 'export', n, function(err) {
			if(err){
        _unexport(n, function() { _export(n, callback); });
      }else if(typeof callback === 'function'){
        callback();
      }
		}, 1);
	}
};

var Rock = function(){
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
      if(callback){
        return callback(err);
      }
      throw err;
    }
    if(dir.indexOf(direction)===-1){
      return write(path, dir, callback);
    }
    return process.nextTick(callback||NOOP);
  });
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
