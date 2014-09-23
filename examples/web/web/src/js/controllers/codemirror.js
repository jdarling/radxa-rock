var controllers = require('../../lib/controllers.js');
var support = require('../../lib/support');
var el = support.el;

var CodeMirrorController = function(container, data){
  var editor = CodeMirror.fromTextArea(container, {
    mode: "javascript",
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    viewportMargin: Infinity
  });
};

controllers.register('CodeMirror', CodeMirrorController);
