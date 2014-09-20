var net = require('net');
var repl = require('repl');

module.exports = function(options, next){
  net.createServer(function(socket){
    var r = repl.start({
      prompt: '[' + process.pid + '] ' +socket.remoteAddress+':'+socket.remotePort+'> '
      , input: socket
      , output: socket
      , terminal: true
      , useGlobal: false
    })
    r.on('exit', function () {
      socket.end()
    })
    r.context.socket = socket
  }).listen(options.config.port||5001,options.config.host||'localhost');
  next();
};
