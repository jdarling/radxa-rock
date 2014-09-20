var fs = require('fs');
var Hapi = require('hapi');
var util = require('util');
var path = require('path');
var config = require('../lib/config');
var apiConfig = config.section('api', {route: '/api/v1/'});
var pluginsPath = path.resolve(config.pluginsPath||'./plugins/');
var Sockets = require('../lib/sockets');
var sockets = new Sockets();
var Plugger = require('../internal/plugger').Plugger;
var async = require('async');
var pjson = require('../package.json');
var webconfig = config.section('web', {port: 8080, host: '0.0.0.0'});
var stores = require('../lib/store');
var plugger = new Plugger({
    path: pluginsPath
  });

var PORT = webconfig.port;
var server = new Hapi.Server(webconfig.host, PORT);

var started = function(){
  sockets.init(server.listener);
  console.log(pjson.name+" website started on http://%s:%s", webconfig.host, PORT);
};

var loadLib = function(libFile){
  return require('../lib/'+libFile);
};

plugger.load(function(err, plugins){
  if(err){
    console.log(err);
  }
  async.eachSeries(plugins, function(plugin, next){
    try{
      var section = plugin.name.replace(/\.js$/i, '').toLowerCase();
      var cfg = config.section(section, {});
      cfg.route = cfg.route || apiConfig.route;
      console.log('Loading plugin: ', plugin.name);
      plugin.plugin({
        hapi: server,
        sockets: sockets,
        config: cfg,
        lib: loadLib,
        pluginsFolder: pluginsPath,
        plugins: plugins,
        stores: stores
      }, next);
    }catch(e){
      console.log('Error loading: '+(plugin.location||plugin.name));
      console.log(e.stack||e);
      next();
    }
  }, function(){
    server.start(started);
  });
});
