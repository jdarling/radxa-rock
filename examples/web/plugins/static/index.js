var path = require('path');

module.exports = function(options, next){
  var webconfig = options.lib('config.js').section('web', {
      webroot: './web/site',
      hostsroot: './web/sites'
    });
	var config = options.config;
  var server = options.hapi;
  var webroot = path.resolve(config.webroot || webconfig.webroot);
  console.log('Serving static content from: ', webroot);
	server.route({
		method: 'GET',
		path: '/{path*}',
    handler: {
				directory: { path: webroot, listing: false, index: true }
		}
	});
  next();
};
