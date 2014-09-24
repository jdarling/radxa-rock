var fs = require('fs');

var CONST = require('./gpio_defines');
var GPIO_PATH = CONST.GPIO_PATH;

module.exports = {};

var _write = module.exports.write = function(file, str, callback, override) {
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

var _read = module.exports.read = function(file, callback, override) {
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

var _unexport = module.exports.unexport = function(pinNumber, callback) {
  return _write(GPIO_PATH + 'unexport', pinNumber, callback, true);
};

var _export = module.exports.export = function(pinNumber, callback) {
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
