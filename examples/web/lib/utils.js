var reTrue = /^(true|t|yes|y|1)$/i;
var reFalse = /^(false|f|no|n|0)$/i;
var path = require('path');

var getExtension = module.exports.getExtension = function(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

var isTrue = exports.isTrue = function(value){
  return !!reTrue.exec(''+value);
};

var isFalse = exports.isFalse = function(value){
  return !!reFalse.exec(''+value);
};

var HashTable = exports.HashTable = function(){
  var instance = this, items = [], indexes = [];
  var getIndex = function(id, defaultIndex){
    defaultIndex = typeof(defaultIndex) === 'undefined' ? -1 : defaultIndex;
    var idx = indexes.indexOf(id);
    return idx===-1?defaultIndex:idx;
  };

  instance.asArray = function(){
    return items;
  };

  instance.slice = function(from, num){
    return items.slice(from, num);
  };

  instance.get = function(id){
    var idx = getIndex(id);
    return idx>-1?items[idx]:false;
  };

  instance.enforce = function(id, record){
    var self = this, l = items.length, idx = getIndex(id, l), result;
    if(idx===l){
      result = items[idx] = typeof(self.initRecord)==='function'?self.initRecord(id, record)||record||{_id: id}:record||{_id: id};
      indexes[idx] = id;
      if(self.initEntry){
        self.initEntry(result);
      }
    }else{
      result = items[idx];
    }
    return result;
  };

  instance.length = function(){
    return items.length;
  };
};

var lowerFirstLetter = exports.lowerFirstLetter = function(string){
  return string.charAt(0).toLowerCase() + string.slice(1);
};

var upperFirstLetter = exports.upperFirstLetter = function(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
};

var mixFromUnderscores = exports.mixFromUnderscores = function(string, excludes){
  excludes = excludes||[];
  var upperIt = function(match){
    if(excludes.indexOf(match.toLowerCase())===-1){
      return match.charAt(1).toUpperCase()+match.substr(2, match.length);
    }else{
      return match;
    }
  };
  return (string.charAt(0).toLowerCase() + string.slice(1)).replace(/(\_[a-z]+)/gi, upperIt);
};

var isNumeric = exports.isNumeric = function (n){
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var defaultMaxInt = exports.defaultMaxInt = function(val, def, max){
  if(!isNumeric(val)){
    return def;
  }
  if(typeof(val)==='string'){
    val = parseInt(val, 10);
  }
  if(isNumeric(max)&&(val>max)){
    return max;
  }else{
    return val;
  }
};

var processTokens = exports.processTokens = function(src, values){
  return JSON.parse(processSimpleTokens(JSON.stringify(src), values));
};

var processSimpleTokens = exports.processSimpleTokens = function(src, values){
  var reTokenExtracter = /\{([^\{]*?)\}/gi;
  var tokenHandler = function(fullToken, symbol){
    var results = fullToken,
        segments = symbol.split('||'),
        parts = segments.shift().split('.'),
        allParts = parts.slice(),
        part, key,
        defaultValue = segments.shift();//||'{'+symbol+'}';
    if(typeof(defaultValue)==='undefined'){
      defaultValue = '';//'{'+symbol+'}';
    }
    key = values;
    while((part = parts.shift()) && key){
      key = key[part];
    }
    if(typeof(key)==='function'){
      results = key(allParts, defaultValue, symbol);
    }else{
      results = key || defaultValue;
    }
    switch(typeof(results)){
      case('string'):
      case('number'):
        break;
      default:
        results = JSON.stringify(results).replace(/\"/gi, '\\"');
    }
    return results;
  };
  return src.replace(reTokenExtracter, tokenHandler);
};

var extend = function() {
  // copy reference to target object
  var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && !typeof target === 'function')
    target = {};

  var isPlainObject = function(obj) {
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)
      return false;

    var has_own_constructor = hasOwnProperty.call(obj, 'constructor');
    var has_is_property_of_method = obj.constructor&&hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf');
    // Not own constructor property must be Object
    if (obj.constructor && !has_own_constructor && !has_is_property_of_method)
      return false;

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.

    var last_key;
    for (key in obj)
      last_key = key;

    return typeof last_key === 'undefined' || hasOwnProperty.call(obj, last_key);
  };

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    if ((options = arguments[i]) !== null) {
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];

        // Prevent never-ending loop
        if (target === copy)
            continue;

        // Recurse if we're merging object literal values or arrays
        if (deep && copy && (isPlainObject(copy) || Array.isArray(copy))) {
          var clone = src && (isPlainObject(src) || Array.isArray(src)) ? src : Array.isArray(copy) ? [] : {};

          // Never move original objects, clone them
          target[name] = extend(deep, clone, copy);

        // Don't bring in undefined values
        } else if (typeof copy !== 'undefined')
          target[name] = copy;
      }
    }
  }

  // Return the modified object
  return target;
};

exports.extend = function(){
  if(!arguments.length) return {};
  var args = Array.apply(null, arguments);
  if(typeof(args[0]) === 'boolean'){
    var deep = args.shift();
    args.unshift(deep, {});
  }else args.unshift(true, {});
  return extend.apply(null, args);
};
