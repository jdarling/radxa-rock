var Plugger = require('./').Plugger;
var path = require('path');

plugger = new Plugger({
  path: path.resolve('./test/plugins')
});

//plugger.load(['test3', 'test2', 'test1'], function(errs, plugins){
plugger.load(['testbad'], function(errs, plugins){
  //console.log('Error: ', errs);
  //console.log('Plugin: ', plugins.length);
  plugins.forEach(function(plugin){
    console.log(plugin.name);
  });
});
