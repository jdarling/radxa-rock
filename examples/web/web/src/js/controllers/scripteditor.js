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
    open: function(src, editor){
      Loader.get('/api/v1/script', function(err, response){
        if(err){
          return alert(err.stack||err.error||err);
        }
        editor.setValue(response);
      });
    },
    save: function(src, editor){
      Loader.post('/api/v1/script', {data: src}, function(err, source){
        if(err){
          return alert(err.stack||err.error||err);
        }
        editor.setValue(source);
        alert('Saved');
      });
    },
    import: function(src, editor){
      var frm = document.createElement('form');
      var finput = document.createElement('input');
      finput.name='uploadfile';
      frm.method='POST';
      frm.action='/api/v1/proxy/loader';
      frm.appendChild(finput);
      finput.type='file';
      finput.onchange = function(){
        Loader.postForm(frm, function(err, response){
          if(err){
            return alert(err.stack||err.error||err);
          }
          editor.setValue(response);
        });
      };
      finput.click();
    },
    export: function(src){
      var link = document.createElement('a');
      link.name= 'source.js';
      link.href= 'data:application/javascript,'+encodeURIComponent(src);
      link.target= '_blank';
      link.click();
    },
    syntax: function(src){
      try{
        var f = new Function(src);
        alert('All good!');
      }catch(e){
        alert(e.stack||e.error||e);
      }
    },
    execute: function(src){
      Loader.post('/api/v1/script/execute', {data: src}, function(err, data){
        if(err){
          return alert(err.stack||err.error||err);
        }
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
