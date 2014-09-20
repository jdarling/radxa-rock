var statsConfig = {
  handler: function(req, reply){
    reply({
      mem: process.memoryUsage(),
      uptime: process.uptime(),
      piid: process.pid
    });
  }
};

module.exports = function(options, next){
  var config = options.config;
  var server = options.hapi;
  server.route([
    {
      method: 'GET',
      path: config.route + (config.path||'status'),
      config: statsConfig
    }
  ]);
  next();
};
