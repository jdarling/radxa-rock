var fs = require('fs');
var vm = require('vm');
var rock = require('../../lib/rock');
var CONST = require('../../../../index').CONST;

var source = '// Put your source here\n\n'+
      'rock.setPinMode(J12_P37, \'output\', function(){\n'+
      '  rock.set(J12_P37, 1, function(){\n'+
      '    setTimeout(function(){\n'+
      '      rock.set(J12_P37, 0);\n'+
      '    }, 1000);\n'+
      '  });\n'+
      '});\n';

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

var activateScript = function(req, reply){
  var source = req.payload;
  var sandbox = {
    rock: rock,
    setTimeout: setTimeout
  };
  var keys = Object.keys(CONST);
  keys.forEach(function(key){
    sandbox[key] = CONST[key];
  });
  try{
    var f = new Function(source);
    reply({
      root: 'result',
      result: vm.runInNewContext(source, sandbox)
    });
  }catch(e){
    reply({
      root: 'error',
      error: e.stack||e
    });
  }
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
    {
      method: 'POST',
      path: config.route+(config.path||'script/activate'),
      handler: activateScript
    }
  ]);
  next();
};
