try{
  var redis = require('redis');
}catch(e){
  console.log('redis is NOT installed, please "npm install redis" to use this module');
  throw e;
}

var config = require('../../lib/config.js').section('store', {
    port: 6379,
    host: '127.0.0.1'
  });
var client;

if(config.unix_socket||config.unixSocket){
  client = redis.createClient(config.unix_socket||config.unixSocket, config);
}else{
  client = redis.createClient(config.port, config.host, config);
}

var sift = require('sift');

var noop = function(){};
var isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};
var _stores = {};

var Store = module.exports = function(storeName){
  var self = this;
  self.storeName = storeName;
};

Store.prototype.get = function(_id, callback){
  var self = this;
  client.hget(self.storeName+'_', _id, function(err, res){
    if(err){
      return callback(err);
    }
    var response = {
      root: self.storeName
    };
    response[self.storeName] = JSON.parse(res.toString());
    return callback(null, response);
  });
};

Store.prototype.insert = function(record, callback){
  var self = this;
  client.incr(self.storeName, function(err, _id){
    if(err){
      return callback(err);
    }
    record._id = _id;
    client.hset(self.storeName+'_', _id, JSON.stringify(record), function(err, response){
      if(err){
        return callback(err);
      }
      var response = {
        root: self.storeName
      };
      response[self.storeName] = response;
      return callback(null, response);
    });
  });
};

Store.prototype.update = function(_id, record, callback){
  var self = this;
  client.hset(self.storeName+'_', _id, JSON.stringify(record), function(err, response){
    if(err){
      return callback(err);
    }
    var response = {
      root: self.storeName
    };
    response[self.storeName] = response.toString();
    return callback(null, response);
  });
};

Store.prototype.delete = function(_id, callback){
  var self = this;
  client.hdel(self.storeName+'_', _id, function(err, response){
    if(err){
      return callback(err);
    }
    return callback(null, response);
  });
};

var buildCompareFunc = function(o){
  var keys = Object.keys(o), val, ord;
  var src = 'var cmp = '+(function(a, b){
    var v;
    if(!isNaN(parseFloat(a)) && isFinite(b)){
      v = a-b;
      if(v>0) return 1;
      if(v<0) return -1;
      return 0;
    }else{
      return (""+a).localeCompare(""+b);
    }
  }).toString()+'\r\n';
  keys.forEach(function(key){
    val = o[key];
    if(val>0){
      ord = 'a.'+key+', b.'+key;
    }else if(val<0){
      ord = 'b.'+key+', a.'+key;
    }
    src += 'v = cmp('+ord+');\r\n'+
      'if(v!=0) return v\r\n';
  });
  src+='return 0;';
  return new Function('a', 'b', src);
};

Store.prototype.asArray = function(options, callback){
  var self = this;
  client.hkeys(self.storeName+'_', function(err, keys){
    if(err){
      return callback(err);
    }
    client.hmget(self.storeName+'_', keys, function(err, store){
      if(err){
        return callback(err);
      }
      store = store.map(JSON.parse);
      var records = options.filter?sift(options.filter, store):store;
      var count = records.length;
      var offset = isNumeric(options.offset)?parseInt(options.offset):0;
      var limit = isNumeric(options.limit)?parseInt(options.limit):count;
      var result = {
          length: count,
          count: records.length,
          limit: limit,
          offset: offset,
          root: self.storeName
        };
      if(options.sort){
        var f = buildCompareFunc(options.sort);
        records = records.sort(f);
      }
      records = result[self.storeName] = records.slice(offset, limit);
      callback(null, result);
    });
  });
};

Store.prototype.upsert = function(key, record, callback){
  var self = this;
  client.hset(self.storeName+'_', key, JSON.stringify(record), function(err, response){
    if(err){
      return callback(err);
    }
    var response = {
      root: self.storeName
    };
    response[self.storeName] = response.toString();
    return callback(null, response);
  });
};

Store.prototype.ensure = function(record, callback){
  var self = this;
  self.asArray({filter: record}, function(err, recs){
    if(err){
      return callback(err);
    }
    recs = recs[recs.root];
    if((!recs)||recs.length==0){
      self.insert(record, callback);
    }else{
      callback(null, recs[0]);
    }
  });
};
