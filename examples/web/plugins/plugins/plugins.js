var path = require('path');

module.exports = function(options, next){
  var config = options.config;
  var server = options.hapi;
  server.route({
    method: 'GET',
    path: config.route+(config.path||'plugins'),
    handler: function(req, reply){
      reply({
        path: options.pluginsFolder,
        plugins: options.plugins
      });
    }
  });
  next();
};
