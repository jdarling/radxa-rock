var Hapi = require('hapi');
var Joi = require('joi');

var routeConfig = {
  /*
  description: "Used to proxy a request from the client to an external endpoint.",
  validate: {
    query: Joi.object({url: Joi.string().required() }).options({allowUnknown: true})
  },
  */
  handler: {
    proxy: {
      mapUri: function(req, cb){
        if(!req.query.url){
          req.raw.res.end('Need URL');
        }else{
          return cb(null, req.query.url);
        }
      }
    }
  }
};

var proxyLoader = function(req, reply){
  reply(req.payload.uploadfile?req.payload.uploadfile:req.payload);
};

module.exports = function(options, next){
	var config = options.config;
  var server = options.hapi;
  server.route([
    {
      method: 'GET',
      path: config.route + 'proxy',
      config: routeConfig
    },
    {
      method: 'POST',
      path: config.route + 'proxy',
      config: routeConfig
    },
    {
      method: 'POST',
      path: config.route + 'proxy/loader',
      handler: proxyLoader
    },
    {
      method: 'PUT',
      path: config.route + 'proxy',
      config: routeConfig
    },
    {
      method: 'DELETE',
      path: config.route + 'proxy',
      config: routeConfig
    },
  ]);
  next();
};
