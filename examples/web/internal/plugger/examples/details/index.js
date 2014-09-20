var Plugger = require('../../').Plugger;

var plugger = new Plugger({path: './plugins'});

plugger.load(function(err, plugins){
  var details = plugger.details();
  var plugins = Object.keys(details);
  var keys, s;
  plugins.forEach(function(name){
    if(!keys){
      keys = Object.keys(details[name]);
      keys.splice(keys.indexOf('plugin'), 1);
      console.log(keys.join('\t'));
    }
    s = '';
    keys.forEach(function(key){
      s+=details[name][key]+'\t';
    });
    console.log(s);
  });
});