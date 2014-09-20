/*
  Store(name)
    get(id, callback)
    insert(record, callback)
    update(id, record, callback)
    upsert(id, record, callback)
    delete(id, callback)
    asArray(options, callback)
      options{
        offset: Number
        limit: Number
        filter: Object
        sort: {
          Key: Direction(1 Ascending, -1 Descending)
          ...
        }
      }
    ensure(record, callback)
*/

var config = require('../lib/config');
var storeType = config.section('store', {type: 'memory'}).type;
var _stores = {};
var Store = require('./stores/memory');
var logger = require('../lib/logger');

var loadStore = function(collectionName){
  return new Store(collectionName);
};

var getStore = module.exports = function(collectionName){
  return _stores[collectionName] || (_stores[collectionName] = loadStore(collectionName));
};

try{
  try{
    Store = require('./stores/'+storeType);
  }catch(e){
    console.log(e);
    try{
      Store = require(storeType);
    }catch(e){
      throw e;
    }
  }
}catch(e){
  logger.log(storeType+' not availble falling back to in-memory store.');
  logger.log(e);
  if(e.stack){
    logger.log(e.stack);
  }
}
