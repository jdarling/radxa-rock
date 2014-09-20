var Loader = require('../lib/loader.js');
var Support = require('../lib/support.js');
var el = Support.el;
var els = Support.els;

var Partials = function(options){
  var self = this;
  self.options = options;
  self.options.ext = self.options.ext || ".html";
  self.options.path = self.options.path || "/partials/";
};

Partials.prototype.set = function(templateName, source){
  var elem = el('#'+templateName);
  if(!elem){
    elem = document.createElement('script');
    elem.setAttribute('type', 'text/x-template');
    elem.setAttribute('id', templateName);
    document.getElementsByTagName('head').item(0).appendChild(elem);
  }
  elem.innerHTML = source;
  Handlebars.registerPartial(templateName, Handlebars.compile(source));
};

Partials.prototype.get = function(templateName, callback){
  var self = this;
  var elem = el('#'+templateName);
  if(!elem){
    elem = document.createElement('script');
    elem.setAttribute('type', 'text/x-template');
    elem.setAttribute('id', templateName);
    document.getElementsByTagName('head').item(0).appendChild(elem);
  }
  if(!elem.innerHTML){
    Loader.get(self.options.path+templateName+self.options.ext, function(err, template){
      if(err){
        return callback(err);
      }
      elem.innerHTML = template;
      try{
        self.set(templateName, elem.innerHTML);
        callback(null, Handlebars.partials[templateName]);
      }catch(e){
        callback(e, Handlebars.partials[templateName]);
      }
    });
  }else{
    try{
      if(!Handlebars.partials[templateName]){
        self.set(templateName, elem.innerHTML);
      }
      callback(null, Handlebars.partials[templateName]);
    }catch(e){
      callback(e, Handlebars.partials[templateName]);
    }
  }
};

Partials.prototype.preload = function(callback){
  var self = this;
  var toLoad = 1;
  var doneLoading = function(){
    toLoad--;
    if(toLoad<1){
      setTimeout(callback, 1);
    }
  };
  els('[type="text/x-template"]').forEach(function(elem){
    var templateName = elem.getAttribute('id');
    toLoad++;
    self.get(templateName, doneLoading);
  });
  doneLoading();
};

module.exports = Partials;