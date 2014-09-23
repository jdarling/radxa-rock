var fs = require('fs');

var source = '// Put your source here';

var getScript = function(req, reply){
  fs.readFile('./script.js', function(err, script){
    if(err){
      return reply({
        root: 'script',
        script: source
      });
    }
    return reply({
      root: 'script',
      script: script.toString()
    });
  });
};

var updateScript = function(req, reply){
  source = req.payload;
  reply({
    root: 'script',
    script: source
  });
};

module.exports = function(options, next){
  var config = options.config;
  var server = options.hapi;
  server.route([
    {
      method: 'GET',
      path: config.route+(config.path||'script'),
      handler: getScript
    },
    {
      method: 'PUT',
      path: config.route+(config.path||'script'),
      handler: updateScript
    },
    {
      method: 'POST',
      path: config.route+(config.path||'script'),
      handler: updateScript
    },
  ]);
  next();
};
