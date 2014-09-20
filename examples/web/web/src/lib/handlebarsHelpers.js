var containerIdx = 0;

var helpers = {
  JSONstringify: function(data){
    return JSON.stringify(data, null, '  ');
  },
  limit: function(ary, max, options) {
    if(!ary || ary.length == 0){
      return options.inverse(this);
    }
    var result = [ ];
    for(var i = 0; i < max && i < ary.length; ++i){
      result.push(options.fn(ary[i]));
    }
    return result.join('');
  },
  isComplex: function(obj){
    if(typeof(obj)==='object'){
      return true;
    }
    return false;
  },
  ifComplex: function(obj, options){
    if(typeof(obj)==='object'){
      return options.fn(this);
    }
    return options.inverse(this);
  },
  notPrivate: function(data, options){
    var res = {}, key;
    for(key in data){
      if(key.substr(0,1)!=='_'){
        res[key] = data[key];
      }
    }
    return options.fn(res);
  },
  keys: function(what, options){
    return options.fn(Object.keys(what));
  },
  eachKeys: function(what, options){
    var keys = Object.keys(what||{});
    var ret = '';
    keys.forEach(function(key){
      ret += options.fn({key: key, value: what[key]});
    });
    return ret;
  },
  getval: function(from, key, def){
    return from[key]||def||'';
  },
  properCase: function(val){
    var result = (val||'').replace( /([A-Z])/g, " $1");
    var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  },
  embed: function(name, scope){
    var id = 'component_'+(containerIdx++);
    var controllerName = el('#'+name).getAttribute('data-controller');
    if(controllerName){
      var html = '<div id="'+id+'"></div>';
      setTimeout((function(id, controllerName, scope){
        return function(){
          var pane = el('#'+id);
          controllers.create(pane, controllerName, {data: scope, template: el('#'+name).innerHTML});
        }
      })(id, controllerName, scope), 10);
    }else{
      html = template(scope, {helpers: handlebarsHelpers});
    }
    return new Handlebars.SafeString(html);
  },
  qrcode: function(data, size){
    var id = 'component_'+(containerIdx++);
    setTimeout((function(id){
      return function(){
        var qrcode = new QRCode(id, {
          width: size,
          height: size
        });
        qrcode.makeCode(data);
      }
    })(id), 10);
    return new Handlebars.SafeString('<div id="'+id+'"></div>');
  },
  log: function(what){
    console.log(what);
    return;
  },
  moment: function(dt, f){
    return moment(dt).format(f);
  },
  ifCond: function(v1, operator, v2, options){
    switch (operator) {
      case '==':
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
      case '===':
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
      case '&&':
        return (v1 && v2) ? options.fn(this) : options.inverse(this);
      case '||':
        return (v1 || v2) ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  },
};
var key;
for(key in Handlebars.helpers){
  helpers[key] = helpers[key] || Handlebars.helpers[key];
}

module.exports = helpers;
