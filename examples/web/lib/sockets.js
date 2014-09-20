var SocketIO = require('socket.io');
var logger = require('../lib/logger');
var config = require('../lib/config').section('socket_io', {});
var io;

var Sockets = function(){
  var self = this;
  self._listeners = [];
};

Sockets.prototype.init = function(server){
  var self = this;
  self.io = SocketIO.listen(server, config);
  self.io.sockets.on('connection', function(socket){
    socket.on('message', function(msg){
      logger.log('Message: ', msg);
      socket.broadcast.emit('message', msg);
    });
    self._listeners.forEach(function(listener){
      socket.on(listener.event, (function(handler){
        return function(data, fn){
          handler(data, socket, fn);
        };
      })(listener.handler));
    });
  });
};

Sockets.prototype.on = function(event, handler){
  var self = this;
  self._listeners.push({
    event: event,
    handler: handler
  });
};

Sockets.prototype.broadcast = function(event, msg){
  var self = this;
  self.io.sockets.emit(event, msg);
};

module.exports = Sockets;
