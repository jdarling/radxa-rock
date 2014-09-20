'use strict';

var async = require('async');
var path = require('path');
var fs = require('fs');
var vm = require('vm');

var noop = function noop(){};

var DEFAULTS = require('./defaults');

var _defaults = function _defaults(src, overrides){
  var keys = Object.keys(src);
  var dst = overrides;
  keys.forEach(function _defaultsKeys(key){
    if(dst[key] === void(0)){
      dst[key] = src[key];
    }else if(src[key] && typeof(src[key])==='object'){
      dst[key] = _defaults(src[key], dst[key]||{});
    }
  });
  return dst;
};

var Plugger = function Plugger(options){
  var self = this;
  self.handlers = {};
  self.plugins = {};
  self.options = _defaults(DEFAULTS, options||{});
};

Plugger.prototype.handle = function Plugger_handle(event){
  var self = this;
  var data = Array.prototype.slice.apply(arguments);
  var f = self.handlers[event];
  var callback = noop;
  if(f){
    if(typeof(data[data.length])==='function'){
      callback = data.pop();
    }
    process.nextTick(function Plugger_handle_nextTick(){
      if(f instanceof Array){
        async.eachSeries(f, function Plugger_handle_nextTick_eachSeries(func, next){
          data.push(function Plugger_handle_nextTick_eachSeries_dataPush(err){
            data.pop();
            next(err);
          });
          func.apply(self, data);
        }, callback);
      }else{
        data.push(callback);
        f.apply(self, data);
      }
    });
    return true;
  }
  return false;
};

Plugger.prototype.plugin = function plugin(location){
  var self = this;
  return (self.plugins[location]||{}).plugin;
};

Plugger.prototype.plugins = function plugins(){
  var self = this;
  var results = [], keys = Object.keys(self.plugins);
  keys.forEach(function plugins_keys(key){
    results.push(self.plugins[key].plugin);
  });
  results.sort(function pkgs_sort(a, b){
    if(_requires(a, b)){
      return -1;
    }
    return a.priority - b.priority;
  });
  return results;
};

Plugger.prototype.status = function status(location){
  var self = this;
  return (self.plugins[location]||{status: 'unknown'}).status;
};

Plugger.prototype.location = function location(location){
  var self = this;
  return (self.plugins[location]||{}).location;
};

Plugger.prototype.details = function details(location){
  var self = this;
  if(location !== void 0){
    return self.plugins[location];
  }else{
    return self.plugins;
  }
};

Plugger.prototype.status = function status(location, status){
  var self = this;
  if(!self.plugins[location]){
    if(status){
      throw new Error('Plugin "'+location+'" not loaded, can\'t set status.');
    }
    return 'unknown';
  }
  if(status){
    self.plugins[plugin].status = status;
  }
  return self.plugins[location].status;
};

/*
  load(callback)
  load(library, callback)
  load([library, library] callback)
*/

var _requires = function _requires(a, b){
  if(a.requires instanceof Array){
    return a.requires.indexOf(b.name) > -1;
  }
  if(b.requires instanceof Array){
    return b.requires.indexOf(a.name) > -1;
  }
  return false;
};

var _findFile = function _findFile(file, location){
  try{
    var folder = path.resolve(location, file);
    var stat = fs.lstatSync(folder);
    if(stat.isDirectory()){
      if(fs.existsSync(folder+path.sep+'plugger.json')){
        return folder+path.sep+'plugger.json';
      }else if(fs.existsSync(folder+path.sep+'index.js')){
        return folder+path.sep+'index.js';
      }
    }else if(stat.isFile()){
      return folder;
    }
  }catch(e){
    if(fs.existsSync(folder+'.js')){
      return folder+'.js';
    }
  }
  try{
    file = require.resolve(file);
    var loc = loc.split(/[\\\/]/gi);
    loc.pop();
    while(loc.length>0){
      if(fs.existsSync(loc.join(path.sep)+path.sep+'package.json')){
        if(fs.existsSync(loc.join(path.sep)+path.sep+'plugger.json')){
          return loc.join(path.sep)+path.sep+'plugger.json';
        }
        break;
      }
      loc.pop();
    }
    return file;
  }catch(e){
    console.log('_findFile ERROR: ', e);
  }
};

var _doLoad = function _doLoad(file, root, name, callback){
  var isPlugger = file && !!file.match(/plugger.json$/i);
  var lib;
  if(isPlugger){
    try{
      var sandbox = {}, location;
      var folder = file.split(/[\\\/]/gi);
      folder.pop();
      folder = folder.join(path.sep)+path.sep;
      vm.runInNewContext('this.config = '+fs.readFileSync(file), sandbox);
      lib = sandbox.config||{};
      location = folder + (lib.main||'index.js');
      lib.plugin = require(location);
      return callback(null, lib);
    }catch(e){
      e.plugin = name;
      e.location = location || folder;
      console.log('-=['+name+'-'+folder+']=-');
      console.log(e);
      console.log(e.stack);
      return callback(e);
    }
  }else{
    try{
      lib = require(file);
      return callback(null, lib);
    }catch(e){
      e.plugin = name;
      e.location = file;
      return callback(e);
    }
    try{
      lib = require(file);
    }catch(e){
      try{
        lib = require(name);
      }catch(e){
        e.plugin = name;
        e.location = path.resolve(root, name);
        return callback(e);
      }
    }
    return callback(null, lib);
  }
};

var _loadLib = function _loadLib(defaultPriority, root, name, callback){
  var self = this;
  if(self.plugins[name]){
    return callback(null, null);
  }
  var file = _findFile(name, root);
  var _lib = self.plugins[name] = {location: file, plugin: null, status: 'loading', name: name};
  var done = function _loadLib_done(lib){
    process.nextTick(function done_nextTick(){
      if(typeof(lib)==='function'){
        lib = {
          priority: defaultPriority,
          plugin: lib
        };
      }
      if(lib.priority === void(0)){
        lib.priority = defaultPriority;
      }
      lib.name = name;
      if(Array.isArray(lib.requires)){
        _loadArray.call(self, defaultPriority, root, lib.requires, function _loadArray(errs, libs){
          if(errs && errs.length){
             _lib.status = 'error';
             _lib.errors = errs;
          }else{
            _lib.status = 'loaded';
            libs.push(lib);
          }
          return callback(errs, libs);
        });
      }else{
        _lib.status = 'loaded';
        return callback(null, [lib]);
      }
    });
  };

  _doLoad(file, root, name, function _loadLib_doLoad(err, lib){
    _lib.plugin = lib;
    if(err){
      callback(err);
      _lib.status = 'error';
    }else{
      done(lib);
    }
  });
};

var _loadFolder = function _loadFolder(defaultPriority, root, callback){
  var self = this;
  fs.readdir(root, function _loadFolder_readdir(err, files){
    if(err){
      return callback(err);
    }
    _loadArray.call(self, defaultPriority, root, files, callback);
  });
};

var _loadArray = function _loadArray(defaultPriority, root, libs, callback){
  var self = this;
  var pkgs = [], errs = [];
  async.each(libs, function _loadArray_each(lib, next){
    _loadLib.call(self, defaultPriority, root, lib, function _loadArray_each_loadLib(err, libs){
      if(err){
        errs.push(err);
      }else if(libs && libs.length){
        Array.prototype.push.apply(pkgs, libs);
      }
      next();
    });
  }, function _loadArray_each_done(){
    pkgs.sort(function pkgs_sort(a, b){
      if(_requires(a, b)){
        return -1;
      }
      return a.priority - b.priority;
    });
    return callback(errs.length?errs:null, pkgs);
  });
};

Plugger.prototype.load = function load(location, callback){
  var self = this, defaultPriority = self.options.defaultPriority;
  var doCallback = function(errs, pkgs){
    self.handle('done', errs, pkgs);
    (callback||noop)(errs, pkgs);
  };
  switch(typeof(location)){
    case('string'):
      return _loadArray.call(self, defaultPriority, self.options.path, [location], doCallback);
    case('function'):
      callback = location;
      location = '';
      return _loadFolder.call(self, defaultPriority, self.options.path, doCallback);
    default:
      return _loadArray.call(self, defaultPriority, self.options.path, location, doCallback);
  }
};

Plugger.prototype.safe = function safe(location, callback){
  var self = this;
  if(self.plugins[name]){
    return callback(null, null);
  }
  var name = location;
  var root = self.options.path;
  var file = _findFile(name, root);
  _doLoad(file, name, root, function safe_doLoad(err, lib){
    if(err){
      return callback(err, false);
    }
    if(Array.isArray(lib.requires)){
      var errors=[];
      async.each(lib.requires, function safe_requires(require, next){
        self.safe(require, function safe_safe(errs, isSafe){
          if(errs){
            errors = errors.concat(errs);
          }
          next();
        });
      }, function(){
        return callback(errors.length?errors:null, errors.length===0);
      });
    }else{
      return callback(null, true);
    }
  });
};

Plugger.prototype.on = function on(event, handler){
  var self = this;
  var handlers = self.handlers[event];
  if(handlers){
    if(handlers instanceof Array){
      handlers.push(handler);
    }else{
      self.handlers[event] = [handlers].concat(handler);
    }
  }else{
    self.handlers[event] = handler;
  }
};

Plugger.prototype.off = function off(event, handler){
  var self = this;
  var handlers = self.handlers[event];
  var i;
  if(!handler){
    self.handlers[event]=false;
    return;
  }
  if(handlers){
    if(handlers instanceof Array()){
      i = handlers.length-1;
      for(; i>-1; i--){
        if(handlers[i] === handler){
          handlers.splice(i, 1);
        }
      }
    }else{
      if(handlers === handler){
        self.handlers[event]=false;
      }
    }
  }
};

Plugger.prototype.done = function done(handler){
  var self = this;
  self.handlers.done = handler;
};

module.exports = Plugger;