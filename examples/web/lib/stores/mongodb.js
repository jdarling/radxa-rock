try{
  var mongodb = require('mongodb');
}catch(e){
  console.log('MongoDB is NOT installed, please "npm install mongodb" to use this module');
  throw e;
}
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
var config = require('../../lib/config.js').section('store', {
    connectionString: 'mongodb://localhost:27017/hapi-base'
  });
var utils = require('../../lib/utils');

var isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var Store = module.exports = function(collectionName){
  var self = this;
  self.collectionName = collectionName;
  self._opened = false;
  MongoClient.connect(config.connectionString, config, function(err, db){
    self.db = db;
    self._opened = true;
    self.db.writeConcern = self.db.writeConcern||'majority';
  });
};

var updateFilterIds = module.exports.updateFilterIds = function(root){
  var keys = Object.keys(root), i, l=keys.length, key, value;
  for(i=0; i<l; i++){
    key = keys[i];
    if(key.match(/\_id$/)){
      try{
        root[key] = ObjectId(root[key]);
      }catch(e){
      }
    }else{
      switch(typeof(root[key])){
        case('object'):
          updateFilterIds(root[key]);
          break;
        case('string'):
          // DateTime String: 2013-08-17T00:00:00.000Z
          if(root[key].match(/^\d{4}\-\d{2}\-\d{2}T\d{2}\:\d{2}\:\d{2}\.\d{3}Z$/i)){
            root[key] = new Date(root[key]);
          }else{
            switch(root[key].toLowerCase()){
              case("$today"):
                root[key] = new Date();
                root[key].setHours(0, 0, 0, 0);
                break;
              case("$yesterday"):
                root[key] = new Date();
                root[key].setDate(root[key].getDate() - 1);
                root[key].setHours(0, 0, 0, 0);
                break;
              case("$thisweek"):
                root[key] = getMonday(new Date());
                break;
              case("$thismonth"):
                root[key] = new Date();
                root[key].setDate(1);
                root[key].setHours(0, 0, 0, 0);
                break;
              case("$thisyear"):
                root[key] = new Date();
                root[key].setMonth(1);
                root[key].setDate(1);
                root[key].setHours(0, 0, 0, 0);
                break;
            }
          }
        default:
      }
    }
  }
  return root;
};

Store.prototype.collection = function(callback, collectionCallback){
  var self = this;
  if(!self._opened){
    return process.nextTick(function(){
      self.collection(callback, collectionCallback);
    });
  }
  self.db.collection(self.collectionName, function(err, collection){
    if(err){
      callback(err);
    }else{
      collectionCallback(collection);
    }
  });
};

Store.prototype.get = function(_id, callback){
  var self = this;
  self.collection(callback, function(collection){
    var filter = updateFilterIds(((typeof(_id)==='object')&&(!(_id instanceof ObjectId)))?_id:{_id: ObjectId(_id)});
    collection.find(filter, function(err, cursor){
      if(err){
        callback(err);
      }else{
        cursor.toArray(function(err, records){
          if(err){
            callback(err);
          }else{
            var response = {
              root: self.collectionName
            };
            if(records.length>1){
              response = {
                root: self.collectionName,
                length: records.length,
                count: records.length,
                offset: 0,
                limit: records.length
              }
              response[self.collectionName] = records;
            }else{
              response[self.collectionName] = records[0];
            }
            callback(null, response);
          }
        });
      }
    });
  });
};

Store.prototype.insert = function(record, callback, noRetry){
  var self = this;
  self.collection(callback, function(collection){
    record._created = new Date();
    collection.insert(record, self.db.writeConcern, function(err, responseRecord){
      if(err&&(err.err === "norepl")&&(err.wnote === 'no replication has been enabled, so w=2+ won\'t work')){
        self.insert(record, callback);
      }else if(err && (!noRetry) && (!!responseRecord)){
        callback(null, responseRecord);
      }else{
        callback(err, responseRecord);
      }
    });
  });
};

Store.prototype.update = function(_id, record, callback){
  var self = this;
  var findKey;
  if(typeof(record)==='function'){
    callback = record;
  }
  if(typeof(_id)==='object' && (!_id instanceof ObjectId)){
    record = _id;
    _id = record._id;
  }
  if(_id===void 0||_id===''||_id===false||_id===null){
    _id = (record||{})._id||false;
  }
  if((!!_id)!==false){
    try{
      findKey = _id instanceof ObjectId?{_id: _id}:{_id: ObjectId(_id)};
    }catch(e){
      if(typeof(_id) === 'object'){
        findKey = _id;
      }else{
        throw e;
      }
    }
  }else{
    findKey = utils.extend(true, {}, record.$set||record);
  }
  delete (record.$set||{})._id;
  delete record._id;
  record._updated = new Date();
  self.collection(callback, function(collection){
    collection.findAndModify(findKey, {$natural: -1}, record, {upsert: true, 'new': true}, function(err, srcRecord){
      if(srcRecord){
        try{
          srcRecord._id = srcRecord._id||((!!_id)!==false)?(_id instanceof ObjectId?_id:ObjectId(_id)):null;
        }catch(e){
        }
      }
      callback(err, srcRecord);
    });
  });
};

Store.prototype.asArray = function(options, callback){
  var self = this;
  self.collection(callback, function(collection){
    var cursor;
    options.skip=parseInt(options.offset)||0;
    options.limit=parseInt(options.limit)||100;
    cursor = collection.find(options.filter, options);
    cursor.count(function(err, count){
      cursor.toArray(function(err, arr){
        var response;
        if(err){
          return callback(err);
        }
        response = {
          length: arr.length,
          count: count,
          limit: options.limit||arr.length,
          offset: options.skip||0,
          root: self.collectionName,
        };
        response[self.collectionName] = arr;
        callback(null, response);
      });
    });
  });
};

Store.prototype.upsert = function(key, record, callback){
  var self = this;
  var findKey;
  record = utils.extend(record.$set?record:{$set: record});
  if(typeof(record)==='function'){
    callback = record;
  }
  if(typeof(_id)==='object' && (!_id instanceof ObjectId)){
    record = _id;
    _id = record._id;
  }
  if(_id===void 0||_id===''||_id===false||_id===null){
    _id = (record||{})._id||false;
  }
  if((!!_id)!==false){
    try{
      findKey = _id instanceof ObjectId?{_id: _id}:{_id: ObjectId(_id)};
    }catch(e){
      if(typeof(_id) === 'object'){
        findKey = _id;
      }else{
        throw e;
      }
    }
  }else{
    findKey = utils.extend(true, {}, record.$set||record);
  }
  delete (record.$set||{})._id;
  delete record._id;
  self.collection(callback, function(collection){
    collection.findAndModify(findKey, {$natural: -1}, record, {upsert: true, 'new': true}, function(err, srcRecord){
      if(srcRecord){
        try{
          srcRecord._id = srcRecord._id||((!!_id)!==false)?(_id instanceof ObjectId?_id:ObjectId(_id)):null;
        }catch(e){
        }
      }
      callback(err, srcRecord);
    });
  });
};

Store.prototype.delete = function(_id, callback){
  var self = this;
  var key = _id instanceof ObjectId?{_id: _id}:{_id: ObjectId(_id)};
  self.collection(callback, function(collection){
    collection.remove(key, callback);
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
