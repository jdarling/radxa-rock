try{
  var levelup = require('levelup');
}catch(e){
  console.log('LevelUp is NOT installed, please "npm install levelup" to use this module');
  throw e;
}
var sift = require('sift');

var config = require('../../lib/config.js').section('store', {
    location: './data',
    provider: 'leveldown'
  });
try{
  var provider = require(config.provider);
}catch(e){
  console.log(provider+' is NOT installed, please "npm install '+provider+'" to use this module');
  throw e;
}
var db = levelup(config.location, {db: provider, valueEncoding: 'json'});
var async = require('async');

var noop = function(){};
var isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};
var _stores = {};

var Store = module.exports = function(collectionName){
  var self = this;
  self.collectionName = collectionName;
};

Store.prototype.get = function(_id, callback){
  var self = this;
  db.get(self.collectionName+':'+_id, function(err, record){
    if(err){
      return callback(err);
    }
    callback(null, {
      root: 'record',
      record: record
    });
  });
};

Store.prototype.insert = function(record, callback){
  var self = this, store = self._store, id = record.id || record._id;
  if(!id){
    id = (new Date()).getTime();
    id += '.'+Math.floor(Math.random()*4357);
  }
  record._created = new Date();
  record._id = id;
  db.put(self.collectionName+':'+id, record, function(err){
    if(err){
      return callback(err);
    }
    return callback(null, record);
  });
};

Store.prototype.update = function(_id, record, callback){
  var self = this;
  db.get(self.collectionName+':'+_id, function(err, curr){
    if(err){
      return callback(err);
    }
    if(record){
      record._created = curr._created;
      record._updated = new Date();
      record._id = _id;
      db.put(self.collectionName+':'+_id, record, function(err){
        if(err){
          return callback(err);
        }
        return callback(null, record);
      });
    }else{
      return callback('Record with ID of '+_id+' does not exist!');
    }
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
  var self = this, records = [];
  var offset = isNumeric(options.offset)?parseInt(options.offset):0;
  var limit = isNumeric(options.limit)?parseInt(options.limit):100;
  var filter = (function(filter){
    if(filter){
      return function(rec){
        return sift(filter, [rec.value]).length > 0;
      };
    }else{
      return function(){
        return true;
      };
    }
  })(options.filter);
  var sortFunc = false;
  if(options.sort){
     sortFunc = buildCompareFunc(options.sort);
  }
  options = options || {};
  db.createReadStream({
    start: self.collectionName+':',
    end: self.collectionName+':\xFF'
  })
  .on('data', function(data){
    var ismatch = filter(data);
    if(ismatch){
      records.push(data.value);
    }
  })
  .on('error', callback)
  .on('close', function(){
    var count = records.length;
    if(sortFunc){
      records.sort(sortFunc);
    }
    records = records.slice(offset, limit);
    process.nextTick(function(){
      var result = {length: count, count: records.length, limit: limit, offset: offset, root: 'response', response: records};
      callback(null, result);
    });
  });
};

Store.prototype.upsert = function(key, record, callback){
  var self = this;
  self.asArray({filter: key}, function(err, recs){
    if(err){
      return callback(err);
    }
    recs = recs[recs.root];
    if((!recs)||recs.length==0){
      self.insert(record, callback);
    }else{
      var results = [];
      async.each(recs, function(rec, next){
        self.update(rec._id, record, function(err, data){
          results.push(data);
          next();
        });
      }, function(){
        callback(null, results.length>1?results:results[0]);
      });
    }
  });
};

Store.prototype.delete = function(id, callback){
  var self = this;
  db.del(self.collectionName+':'+id, function(err){
    callback(err);
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
