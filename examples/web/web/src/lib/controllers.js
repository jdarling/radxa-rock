var ControllerNotFoundException = function(controllerName){
  var self = this;
  self.name = 'ControllerNotFoundException';
  self.message = 'Controller "'+controllerName+'" not registered';
}
ControllerNotFoundException.prototype = Object.create(Error.prototype);

var Controllers = function(){
  this._controllers = {};
};

Controllers.prototype.create = function(container, controllerName, data){
  var Controller = this._controllers[controllerName];
  if(!Controller){
    throw new ControllerNotFoundException(controllerName);
  }
  return container.controller = new Controller(container, data);
};

Controllers.prototype.get = function(controllerName){
  return this._controllers[controllerName];
};

Controllers.prototype.register = function(controllerName, controller){
  this._controllers[controllerName] = controller;
};

var cleanupControllers = function (e) {
  var walkForRemoval = function(node){
    if(node && node.children){
      var i, l = node.children.length, child;
      for(i=0; i<l; i++){
        child = node.children[i];
        walkForRemoval(child);
      }
    }
    if(node.controller){
      if(node.controller.teardown){
        node.controller.teardown(node);
      }
      node.controller = null;
    }
  };
  if(e.type=='DOMNodeRemoved'){
    var n = e.target;
    walkForRemoval(n);
  }
};

if(typeof(MutationObserver)!=='undefined'){
  var observer = new MutationObserver(function(mutations){
    mutations.forEach(function(mutation){
      var removed = mutation.removedNodes?Array.prototype.slice.apply(mutation.removedNodes):[];
      removed.forEach(cleanupControllers);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}else{
  document.body.addEventListener('DOMNodeRemoved', cleanupControllers, true);
}

var controllers = new Controllers();
module.exports = controllers;
