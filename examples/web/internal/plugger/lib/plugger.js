(function(){
  'use strict';

  var async = require('async');
  var path = require('path');
  var fs = require('fs');
  var vm = require('vm');
  var semver = require('semver');
  var noop = function noop(){};

  var DEFAULTS = require('./defaults');
  var ERRORS = require('./errors');

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
    self.plugins = {};
    self.types = {};
    self.roles = {};
    self.options = _defaults(DEFAULTS, options||{});
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
    var r;
    results.sort(_libsSort);
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
        throw new ERRORS.PluginNotLoaded(location);
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
      if(a.requires.indexOf(b.name) > -1){
        return 1;
      }
    }
    if(b.requires instanceof Array){
      if(b.requires.indexOf(a.name) > -1){
        return -1;
      }
    }
    return 0;
  };

  var _libsSort = function _libsSort(a, b){
    var r = _requires(a, b);
    if(r !== 0){
      return r;
    }
    if(a.priority > b.priority){
      return 1;
    }else if(a.priority < b.priority){
      return -1;
    }else{
      return 0;
    }
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
      return new ERRORS.FileNotFound(file, location);
    }
  };

  var _require = require;

  var _loadLib = function _loadLib(root, name, callback){
    var file = _findFile(name, root);// || new ERRORS.FileNotFound(name, root);
    if(file instanceof ERRORS.FileNotFound){
      return callback(file);
    }
    var isPlugger = file && !!file.match(/plugger.json$/i);
    var lib;
    var done = function _loadLib_done(lib){
      process.nextTick(function done_nextTick(){
        if(typeof(lib)==='function'){
          lib = {
            priority: 0,
            version: '0.0.0',
            plugin: lib
          };
        }
        if(lib.version === void(0)){
          lib.version = '0.0.0';
        }
        lib.name = name;
        if(!semver.valid(lib.version)){
          return callback(new ERRORS.InvalidSemVer(name, lib.version), lib);
        }
        return callback(null, lib);
      });
    };
    if(isPlugger){
      try{
        var sandbox = {}, location;
        var folder = file.split(/[\\\/]/gi);
        folder.pop();
        folder = folder.join(path.sep)+path.sep;
        vm.runInNewContext('this.config = '+fs.readFileSync(file), sandbox);
        lib = sandbox.config||{};
        location = folder + (lib.main||'index.js');
        lib.plugin = _require(location);
        return done(lib);
      }catch(e){
        e.plugin = name;
        e.location = location || folder;
        return callback(e);
      }
    }else{
      try{
        lib = _require(file);
        return done(lib);
      }catch(e){
        e.plugin = name;
        e.location = file;
        return callback(e);
      }
      try{
        lib = _require(file);
      }catch(e){
        try{
          lib = _require(name);
        }catch(e){
          e.plugin = name;
          e.location = path.resolve(root, name);
          return callback(e);
        }
      }
      return done(lib);
    }
  };

  var _loadFolder = function _loadFolder(root, callback){
    var self = this;
    fs.readdir(root, function _loadFolder_readdir(err, files){
      if(err){
        return callback(err);
      }
      _loadArray.call(self, root, files, callback);
    });
  };

  var _loadArray = function _loadArray(root, libs, callback){
    var self = this;
    if(arguments.length===2){
      callback = libs;
      libs = root;
      root = self.options.path;
    }
    var stack = [].concat(libs);
    var errs = [], _libs = [];
    var done = function _loadArray_done(){
      var r;
      _libs.sort(_libsSort);
      callback(errs.length?errs:null, _libs);
    };
    var next = function _loadArray_next(){
      if(stack.length){
        process.nextTick(function doLoad_nextTick(){
          doLoad();
        });
      }else{
        done();
      }
    };
    var doLoad = function _loadArray_doLoad(){
      var name = stack.shift();
      var needsLoad = !self.plugins[name];
      var _lib = self.plugins[name] = {name: name, status: 'loading'};
      if(!needsLoad){
        return next();
      }
      _loadLib(root, name, function(err, lib){
        if(lib){
          lib.status = 'ready';
          lib.name = name;
          if(Array.isArray(lib.requires)){
            Array.prototype.push.apply(stack, lib.requires);
          }
          if(lib.priority === void(0)){
            lib.priority = self.options.defaultPriority;
          }
          self.plugins[name] = _lib = lib;
          if(lib.role){
            if(!self.roles[lib.role]){
              self.roles[lib.role] = [];
            }
            self.roles[lib.role].push(lib);
          }
          if(lib.type){
            if(!self.roles[lib.type]){
              self.roles[lib.type] = [];
            }
            self.roles[lib.type].push(lib);
          }
          _libs.push(lib);
        }
        if(err){
          err.plugin = err.plugin || name;
          err.location = err.location || root;
          _lib.status = 'error';
          _lib.error = err;
          errs.push(err);
        }
        next();
      });
    };
    doLoad();
  };

  Plugger.prototype.load = function load(location, callback){
    var self = this, defaultPriority = self.options.defaultPriority;
    var doCallback = function(errs, pkgs){
      (callback||noop)(errs, pkgs);
    };
    switch(typeof(location)){
      case('string'):
        return _loadArray.call(self, [location], doCallback);
      case('function'):
        callback = location;
        location = '';
        return _loadFolder.call(self, self.options.path, doCallback);
      default:
        return _loadArray.call(self, location, doCallback);
    }
  };

  var _validateRequires = function _validateRequires(requires, callback){
    var self = this;
    var i, l=requires.length;
    var errors = [];
    for(i=0; i<l; i++){
      if(!self.plugins[requires[i]]){
        errors.push(new ERRORS.PluginDoesNotExist(requires[i]));//new Error('Plugin '+requires[i]+' does not exist'));
      }
    }
    return callback(errors.length?errors:null, !errors.length);
  };

  Plugger.prototype.safe = function safe(root, name, callback){
    var self = this;
    if(arguments.length===2){
      callback = name;
      name = root;
      root = self.options.path;
    }
    _loadLib(root, name, function(err, lib){
      if(err){
        return callback(err, false);
      }
      if(!lib){
        return callback(new Error('Something went really wrong'), false);
      }
      if(!Array.isArray(lib.requires)){
        return callback(null, true);
      }
      _validateRequires.call(self, lib.requires, callback);
    });
  };

  module.exports = Plugger;
})();
