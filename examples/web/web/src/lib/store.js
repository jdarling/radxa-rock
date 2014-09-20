var Record = function(data){
  var self = this, keys = self.keys = new Array(), key;
  self._listeners = {};
  self._data = data;
};

Record.prototype.on = function(event, handler){
  self._listeners[event] = self._listeners[event] || [];
  self._listeners[event].push(handler);
};

Record.prototype.off = function(event, handler){
  var result = false;
  if(self._listeners[event] instanceof Array){
    if(handler){
      var i, l = self._listeners[event].length;
      for(i=l; i>-1; --i){
        if(self._listeners[event][i]===handler){
          self._listeners[event].splice(i, 1);
          result = true;
        }
      }
    }else{
      delete self._listeners[event];
      self._listeners[event] = false;
      result = true;
    }
  }
  return result;
};

Record.prototype.handle = function(event, data){
  var self = this, handlers = self._listeners[event] || [], i, l = handlers.length;
  for(i=0; i<l; i++){
    handlers[i].call(self, data);
  }
};

Record.prototype.raw = function(){
  var self = this;
  return self._data;
};

Record.prototype.get = function(key){
  var self = this;
  return self._data[key];
};

Record.prototype.set = function(key, value){
  var self = this;
  self._data[key] = value;
  self.handle('updated', key);
  return value;
};

Record.prototype.remove = function(key){
  var self = this;
  delete self._data[key];
  self.handle('removed', key);
  return value;
};

Record.prototype.update = function(update){
  var self = this, key;
  for(key in update){
    self._data[key] = update[key];
  }
  self.handle('updated');
};

Record.prototype.toString = function(){
  var self = this;
  return JSON.stringify(self._data);
};

var Store = function(options){
  var self = this;
  self.records = new Array();
  self._updates = 0;
  self._listeners = {};
  self.options = options || {};
};

Store.prototype.on = function(event, handler){
  self._listeners[event] = self._listeners[event] || [];
  self._listeners[event].push(handler);
};

Store.prototype.off = function(event, handler){
  var result = false;
  if(self._listeners[event] instanceof Array){
    if(handler){
      var i, l = self._listeners[event].length;
      for(i=l; i>-1; --i){
        if(self._listeners[event][i]===handler){
          self._listeners[event].splice(i, 1);
          result = true;
        }
      }
    }else{
      delete self._listeners[event];
      self._listeners[event] = false;
      result = true;
    }
  }
  return result;
};

Store.prototype.handle = function(event, data){
  var self = this, handlers = self._listeners[event] || [], i, l = handlers.length;
  for(i=0; i<l; i++){
    handlers[i].call(self, data);
  }
};

Store.prototype.beginUpdate = function(){
  var self = this;
  self._updates++;
};

Store.prototype.endUpdate = function(){
  var self = this;
  if(self._updates){
    self._updates--;
    if(self._updates==0){
      self.handle('updated');
    }
  }
};

Store.prototype.insert = function(rec){
  var self = this, record = new Record(rec);
  self.records.push(record);
  self.handle('inserted', record);
};

Store.prototype.find = function(query){
  var self = this;
  return sift(query, self.records);
};

Store.prototype.get = function(id){
  var self = this, records = self.find({_id: id});
  return records.length?records[0]:false;
};

Store.prototype.update = function(id, rec){
  var self = this;
  if(rec === void 0){
    id = rec._id || rec.name;
  }
  rec._id = id || rec._id || rec.name;
  if(record = self.get(id)){
    record.update(rec);
    return true;
  }
  return false;
};

Store.prototype.upsert = function(rec){
  var self = this;
  if(!self.update(rec._id, rec)){
    self.insert(rec);
  }
  return self;
};

Store.record = Record;

module.exports = Store;
