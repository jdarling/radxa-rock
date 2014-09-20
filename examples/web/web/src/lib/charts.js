var Module = {};

var lambda = (function(){
  var stringType = typeof('');
  var undefinedType = (function(undefined){
    return typeof(undefined);
  })();
  var Lambda = function(expression){
    var self = this, type = typeof(expression);
    // The idea for this was taken from linq.js (http://linqjs.codeplex.com/)
    // Then it was re-written to fit this project's concept
    // Very interesting project if it wasn't for the poor naming conventions followed for methods
    var identity = function(self){
      return self;
    };
    expression = expression.trim();
    if(expression === null) return identity;
    if(type === undefinedType) return identity;
    if(type === stringType){
      var l;
      if(expression === ""){
        return identity;
      }else if(!expression.match(/[-=]>/g)){
        l = new Function(Lambda.selfSymbol, "return " + expression);
        return function(){
          return l.apply(self, arguments);
        };
      }else if(expression.substr(0, 2)==='->'){
        l = new Function(Lambda.selfSymbol, expression.substr(2));
        return function(){
          return l.apply(self, arguments);
        };
      }else{
        var expr = expression.match(/^[(\s]*([^()]*?)[)\s]*=>(.*)/);
        l = new Function(expr[1], "return " + expr[2]);
        return function(){
          return l.apply(self, arguments);
        };
      }
    }
    return expression;
  };
  Lambda.selfSymbol = 'd';
  return Lambda;
})();

var applyChartConfiguration = Module.applyChartConfiguration = function(prefix, container, instance, immediates){
  var reIsTableConfig = new RegExp('^data-'+prefix+'-');
  var cfg = {}, keys = [];
  var i, attrs=container.attributes, l=attrs.length;

  container.immediates = immediates;
  container.chart = instance;

  for (i=0; i<l; i++){
    var name = attrs.item(i).nodeName, value;
    if(name.match(reIsTableConfig)){
      name = name.replace(reIsTableConfig, '');
      value = attrs.item(i).value || attrs.item(i).nodeValue;
      keys.push(name);
      try{
        cfg[name] = {
          src: value,
          f: lambda(value)
        };
      }catch(e){
        cfg[name] = {
          src: value,
          f: null
        };
      }
    }
  }

  for (i=0; i<l; i++){
    name = keys[i];
    if(typeof(instance[name])==='function'){
      if(immediates.indexOf(name)>-1){
        instance[name](cfg[name].f());
      }else{
        instance[name](cfg[name].f);
      }
    }
  }
};

Module.getChartPropertyValues = function(container){
  var controller = container.controller?container.controller:container;
  var chart = controller.chart?controller.chart:controller;
  var reGetName = /data-[^-]*-(.*)$/, val;
  var vals = Object.keys(chart).reduce(function(set, key){
    if(key !== 'update' && typeof(chart[key])==='function'){
      try{
        val = chart[key]();
        set[key]= typeof(val)==='function'?'':val;
      }catch(e){
        if(typeof(console)!=='undefined'){
          console.log(key);
          console.log(chart[key]);
          console.error(e);
        }
      }
    }
    return set;
  }, {});
  var i, attrs=container.attributes||[], l=attrs.length, attr;
  for (i=0; i<l; i++){
    attr = attrs.item(i);
    var name = (reGetName.exec(attr.nodeName)||[])[1];
    if(name){
      vals[name] = attr.value || attr.nodeValue;
    }
  }
  return vals;
};

Module.getChartProperties = function(container){
  var controller = container.controller?container.controller:container;
  var chart = controller.chart?controller.chart:controller;
  return Object.keys(chart).reduce(function(set, key){
    if(key !== 'update' && typeof(chart[key])==='function'){
      set.push(key)} return set;
    }, []);
};

Module.setChartProperty = function(container, propertyName, value, data){
  var controller = container.controller;
  var prefix = controller.dataAttributePrefix || 'chart';
  container.setAttribute('data-'+prefix+'-'+propertyName, value);
  applyChartConfiguration(prefix, container, container.chart, container.immediates);
  // Data is getting set back to Array[0] for some reason...  Falling out of scope?
  controller.update(data);
};

Module.getChartProperty = function(container, propertyName){
  var controller = container.controller;
  var chart = controller.chart;
  var i, attrs=container.attributes, l=attrs.length;
  var reMatch = new RegExp('data-[^-]*-'+propertyName+'$');
  for (i=0; i<l; i++){
    var name = attrs.item(i).nodeName;
    if(name.match(reMatch)){
      return attrs.item(i).value || attrs.item(i).nodeValue;
    }
  }
  return ((chart[propertyName]||function(){})());
};

module.exports = Module;
