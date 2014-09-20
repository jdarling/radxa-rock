var request = require('request');
var async = require('async');
var qs = require('qs');

var config = require('../../lib/config.js').section('store', {
    host: 'http://localhost:9291/'
  });

var Store = module.exports = function(collectionName){
  var self = this;
  self.collectionName = collectionName;
  self.host = config.host;
};

Store.prototype.get = function(_id, callback){
  var self = this;
  var uri = self.host+'api/v1/table/'+self.collectionName+'/'+_id;
  request({
    method: 'GET',
    uri: uri,
    json: true
  }, function(error, response, body){
    callback(error, body);
  });
};

Store.prototype.insert = function(record, callback){
  var self = this;
  var uri = self.host+'api/v1/table/'+self.collectionName;
  request({
    method: 'POST',
    uri: uri,
    json: record
  }, function(error, response, body){
    callback(error, body);
  });
};

Store.prototype.update = function(_id, record, callback){
  var self = this;
  var uri = self.host+'api/v1/table/'+self.collectionName+'/'+_id;
  request({
    method: 'PUT',
    uri: uri,
    json: record
  }, function(error, response, body){
    callback(error, body);
  });
};

Store.prototype.delete = function(_id, callback){
  var self = this;
  var uri = self.host+'api/v1/table/'+self.collectionName+'/'+_id;
  request({
    method: 'DELETE',
    uri: uri
  }, function(error, response, body){
    callback(error, body);
  });
};

Store.prototype.asArray = function(options, callback){
  var self = this;
  var uri = self.host+'api/v1/table/'+self.collectionName+'?'+qs.stringify(options||{});
  request({
    method: 'GET',
    uri: uri,
    json: true
  }, function(error, response, body){
    callback(error, body);
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
