var fs = require('fs');
var config = require('../lib/config').section('logger', {level: -1, enabled: true, recordDT: true});

var colors = [
  31,
  33,
  36,
  90,
];

var levels = [
  'error',
  'warn',
  'info',
  'debug'
];

var Logger = function(options){
  var self = this;
  self.options = config;
};

Logger.prototype.log = function(type){
  var self = this;
  var dt = new Date(), args = Array.prototype.slice.apply(arguments), clr, idx = levels.indexOf(args[0]);
  if(idx==-1){
    idx = levels.indexOf('debug');
    args.unshift('');
  }
  if(idx < self.options.level || !self.options.enabled){
    return this;
  }
  clr = colors[idx];
  args[0] = '\033[' + clr + 'm' + levels[idx]+':\t\033[39m';
  if(self.options.recordDT){
    console.log('\033[' + clr + 'm['+dt+']\033[39m');
  }
  console.log.apply(console, args);
  try{
    if(self.log){
      self.log.write('['+dt+']\r\n'+Array.prototype.join.call(arguments, '\t')+'\r\n');
    }
  }catch(e){
  }
  return this;
};

levels.forEach(function(level){
  Logger.prototype[level] = function(){
    var self = this, args = Array.prototype.slice.apply(arguments);
    args.unshift(level);
    return self.log.apply(self, args);
  };
});

module.exports = new Logger();
