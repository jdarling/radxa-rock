var controllers = require('../lib/controllers.js');
var Partials = require('../lib/partials.js');
var handlebarsHelpers = require('../lib/handlebarsHelpers.js');
var Loader = require('../lib/loader.js');
var Support = require('../lib/support.js');
var el = Support.el;
var els = Support.els;

var Application = function(){
  var self = this;
  partials = new Partials({
    path: "partials/",
    ext: ".html"
  });
  partials.preload(function(){
    self.init();
  });
};

Application.prototype.displayPage = function(pageName, data){
  var path = pageName.split('/');
  var nav = path.shift();

  partials.get(pageName, function(err, template){
    if(err){
      console.error(err.stack||err);
      return;
    }
    try{
      var pane = el('#outlet');
      var controllerName = el('#'+pageName).getAttribute('data-controller');
      if(nav==='index'){
        nav = el('nav li a[href="#home"]');
      }else{
        nav = el('nav li a[href="#'+(nav||'home')+'"]');
      }
      pane.innerHTML = template(data||{}, {helpers: handlebarsHelpers});
      if(controllerName){
        controllers.create(pane, controllerName, data);
      }
      var elm, elms = els(pane, '[data-controller]'), i, l=elms.length;
      for(i=0; i<l; i++){
        elm = elms[i];
        controllerName = elm.getAttribute('data-controller');
        controllers.create(elm, controllerName, data);
      }
    }catch(e){
      throw e;
    }
  });
};

Application.prototype.init = function(){
  var app = this;
  var nav = Satnav({
    html5: false,
    force: true,
    poll: 100
  });

  nav
    .navigate({
      path: '/',
      directions: (function(){
        var e = el('script#home');
        var dataApi = e?e.getAttribute('data-api'):false;
        if(dataApi){
          return Loader.get(dataApi, function(err, data){
            return app.displayPage('home', err||data);
          });
        }
        return function(params){
          app.displayPage('home');
        };
      })
    })
    ;

  var e = els('script[nav]'), i=0, l=e.length;
  for(; i<l; i++){
    nav = nav.navigate(
      (function(id, linkTo, dataApi){
        return {
          path: linkTo,
          directions: dataApi?function(params){
            var uri = dataApi.replace(/{([^}]+)}/g,  function(full, sym){
              return params[sym];
            });
            Loader.get(uri, function(err, data){
              app.displayPage(id, err||data);
            });
          }:function(params){
            app.displayPage(id);
          }
        }
      })(e[i].getAttribute('id'), e[i].getAttribute('nav'), e[i].getAttribute('data-api'))
    );
  }

  nav
    .change(function(params, old){
      app.displayPage('loading');
      nav.resolve();
      return this.defer;
    })
    .otherwise('/');
    ;
  nav.go();
};

module.exports = new Application();
