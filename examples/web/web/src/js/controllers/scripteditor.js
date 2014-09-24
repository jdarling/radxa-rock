var controllers = require('../../lib/controllers.js');
var handlebarsHelpers = require('../../lib/handlebarsHelpers');
var support = require('../../lib/support');
var Loader = require('../../lib/loader');
var els = support.els;
var el = support.el;

var ScriptEditorController = function(container, data){
  var self = this;
  var actions = {
    clear: function(src, editor){
      editor.setValue('');
    },
    open: function(){

    },
    save: function(src){

    },
    import: function(){

    },
    export: function(src){

    },
    syntax: function(src){
      try{
        var f = new Function(src);
        alert('All good!');
      }catch(e){
        console.log(e);
        alert(e.stack||e.error||e);
      }
    },
    execute: function(src){
      Loader.post('/api/v1/script/execute', {data: src}, function(err, data){
        if(err){
          console.log(err);
          return alert(err.stack||err.error||err);
        }
        console.log(data);
        alert('All done!');
      });
    },
  };
  var clickHandler = self.clickHandler = function(e){
    if(e.target && e.target.dataset.action){
      var action = e.target.dataset.action;
      var f = actions[action];
      if(f){
        var editor = el(container, 'textarea').controller.editor;
        f(editor.getValue(), editor);
        e.preventDefault();
        return false;
      }
    }
  };
  var keyHandler = self.keyHandler = function(e){
    // don't quite know what to do here yet
  };
  container.addEventListener('click', clickHandler);
  container.addEventListener('keyup', keyHandler);
};

ScriptEditorController.prototype.teardown = function(container){
  var self = this;
  container.removeEventListener('click', self.clickHandler);
  container.removeEventListener('keyup', self.keyHandler);
};

controllers.register('ScriptEditor', ScriptEditorController);
