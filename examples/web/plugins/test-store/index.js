var listRecords = function(req, reply){
  var self = this;
  self.asArray(req.query, function(err, records){
    reply(err||records);
  });
};

var getRecord = function(req, reply){
  var self = this;
  self.get(req.params.id, function(err, record){
    reply(err||record);
  });
};

var postRecord = function(req, reply){
  var self = this;
  self.insert(req.payload, function(err, record){
    reply(err||record);
  });
};

var putRecord = function(req, reply){
  var self = this;
  self.update(req.params.id, req.payload, function(err, response){
    reply(err||response);
  });
};

var deleteRecord = function(req, reply){
  var self = this;
  self.delete(req.params.id, function(err, response){
    reply(err||response);
  });
};

module.exports = function(options, next){
  var config = options.config;
  var server = options.hapi;
  var store = options.stores(config.collectionName||'test');

  server.route([
    {
      method: 'GET',
      path: config.route + 'test',
      handler: listRecords.bind(store)
    },
    {
      method: 'GET',
      path: config.route + 'test/{id}',
      handler: getRecord.bind(store)
    },
    {
      method: 'POST',
      path: config.route + 'test',
      handler: postRecord.bind(store)
    },
    {
      method: 'PUT',
      path: config.route + 'test/{id}',
      handler: putRecord.bind(store)
    },
    {
      method: 'DELETE',
      path: config.route + 'test/{id}',
      handler: deleteRecord.bind(store)
    },
  ]);
  next();
};
