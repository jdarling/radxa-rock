var controllers = require('../../lib/controllers.js');

var CodeMirrorController = function(container, data){
  var editor = CodeMirror.fromTextArea(container, {
    mode: "javascript",
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true
  });
};

controllers.register('CodeMirror', CodeMirrorController);
