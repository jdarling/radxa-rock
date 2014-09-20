var assert = require('assert');
var Plugger = require('../').Plugger;
var DEFAULTS = require('../').DEFAULTS;
var path = require('path');
var semver = require('semver');

describe('Plugger', function(){
  /*
    Should load a single plugin
    Should load all plugins from a folder
    Should order the plugins by priority
    Check that requirements are fulfilled
    Check that exclusions are fulfilled
  */
  describe('Constructor', function(){
    it('Can create an instance', function(done){
      var plugger = new Plugger();
      assert(plugger instanceof Plugger, 'Got a plugger instance');
      done();
    });
    it('Can take custom parameters', function(done){
      var plugger = new Plugger({foo: 'bar'});
      assert(plugger.options.foo === 'bar', 'Option foo === bar');
      assert(plugger.options.path === DEFAULTS.path, 'Option foo === bar');
      done();
    });
  });
  
  describe('Standalone loading', function(){
    var plugger;
    beforeEach(function(done){
      plugger = new Plugger({
        path: path.resolve(__dirname, 'plugins')
      });
      done();
    });
    it('Can load a plugin', function(done){
      plugger.load('test1', function(err, plugin){
        assert(!err, err);
        assert(plugin, 'Got the plugin');
        done();
      });
    });
    it('Can load a plugin with a plugger.json file', function(done){
      plugger.load('test4', function(err, plugin){
        assert(!err, err);
        assert(plugin, 'Got the plugin');
        done();
      });
    });
    it('Can load multiple plugins', function(done){
      plugger.load(['test1', 'test2'], function(errs, plugins){
        if(errs && errs.length){
          /*
          if(errs instanceof Array){
            errs.forEach(function(err){
              console.log(err);
            });
          }else{
            console.log(errs);
          }
          //*/
          assert(!errs, errs[0]);
        }
        assert(plugins, 'Got the plugins');
        assert(plugins.length===3, 'Got '+plugins.length+' plugins');
        done();
      });
    });
    it('Throws an error when it loads a bad plugin', function(done){
      plugger.load('testbad', function(err, plugins){
        assert(err, 'Got the error');
        assert(!plugins.length, 'No plugin');
        done();
      });
    });
    it('Throws an error when there is no plugin', function(done){
      plugger.load('testnone', function(err, plugins){
        assert(err && err.length, 'Got the error');
        assert(!plugins.length, 'No plugin');
        done();
      });
    });
    it('Orders the plugins based on priority', function(done){
      plugger.load(['test1', 'test2'], function(errs, plugins){
        assert(plugins, 'Got the plugins');
        assert(plugins.length===3, 'Got 3 plugins');
        assert(plugins[0].plugin() === 'Test 2', 'Did\'t load 2 first');
        assert(plugins[1].plugin() === 'Test 3', 'Did\'t load 3 second');
        assert(plugins[2].plugin() === 'Test 1', 'Did\'t load 1 last');
        done();
      });
    });
  });
  
  describe('Pluggin Versioning', function(){
    var plugger;
    beforeEach(function(done){
      plugger = new Plugger({
        path: path.resolve(__dirname, 'plugins')
      });
      done();
    });
    it('Provides version on all plugins', function(done){
      plugger.load(['test1', 'test2'], function(errs, plugins){
        assert(plugins, 'Got the plugins');
        plugins.forEach(function(plugin){
          assert(plugin.version, 'Plugin has a version');
          assert(semver.valid(plugin.version), 'Version is a valid SemVer');
        });
        done();
      });
    });
  });

  describe('Loading plugins from folder', function(){
    var plugger;
    beforeEach(function(done){
      plugger = new Plugger({
        path: path.resolve(__dirname, 'plugins')
      });
      done();
    });
    it('Loads plugins from a folder', function(done){
      plugger.load(function(errs, plugins){
        assert(plugins, 'Loaded plugins');
        assert(plugins.length>1, 'Loaded multiple plugins');
        done();
      });
    });
    it('Skips any plugins that error', function(done){
      plugger.load(function(errs, plugins){
        assert(errs && errs.length===1, '1 error for badplugin.js');
        done();
      });
    });
  });
});