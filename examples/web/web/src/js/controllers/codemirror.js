var controllers = require('../../lib/controllers.js');
var support = require('../../lib/support');
var el = support.el;

var CodeMirrorController = function(container, data){
  var self = this;
  var editor = self.editor = CodeMirror.fromTextArea(container, {
    mode: "javascript",
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    viewportMargin: Infinity
  });
};

CodeMirrorController.prototype.teardown = function(){
  var self = this;
  self.editor = null;
};

controllers.register('CodeMirror', CodeMirrorController);
