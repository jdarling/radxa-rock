(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./web/src/js/app.js":[function(require,module,exports){
var controllers = require('../lib/controllers.js');
var Partials = require('../lib/partials.js');
var handlebarsHelpers = require('../lib/handlebarsHelpers.js');
var Loader = require('../lib/loader.js');
var Support = require('../lib/support.js');
var el = Support.el;
var els = Support.els;

var Application = function(){
  var self = this;
  partials = new Partials({
    path: "partials/",
    ext: ".html"
  });
  partials.preload(function(){
    self.init();
  });
};

Application.prototype.displayPage = function(pageName, data){
  var path = pageName.split('/');
  var nav = path.shift();

  partials.get(pageName, function(err, template){
    if(err){
      console.error(err.stack||err);
      return;
    }
    try{
      var pane = el('#outlet');
      var controllerName = el('#'+pageName).getAttribute('data-controller');
      if(nav==='index'){
        nav = el('nav li a[href="#home"]');
      }else{
        nav = el('nav li a[href="#'+(nav||'home')+'"]');
      }
      pane.innerHTML = template(data||{}, {helpers: handlebarsHelpers});
      if(controllerName){
        controllers.create(pane, controllerName, data);
      }
      var elm, elms = els(pane, '[data-controller]'), i, l=elms.length;
      for(i=0; i<l; i++){
        elm = elms[i];
        controllerName = elm.getAttribute('data-controller');
        controllers.create(elm, controllerName, data);
      }
    }catch(e){
      throw e;
    }
  });
};

Application.prototype.init = function(){
  var app = this;
  var nav = Satnav({
    html5: false,
    force: true,
    poll: 100
  });

  nav
    .navigate({
      path: '/',
      directions: (function(){
        var e = el('script#home');
        var dataApi = e?e.getAttribute('data-api'):false;
        if(dataApi){
          return Loader.get(dataApi, function(err, data){
            return app.displayPage('home', err||data);
          });
        }
        return function(params){
          app.displayPage('home');
        };
      })
    })
    ;

  var e = els('script[nav]'), i=0, l=e.length;
  for(; i<l; i++){
    nav = nav.navigate(
      (function(id, linkTo, dataApi){
        return {
          path: linkTo,
          directions: dataApi?function(params){
            var uri = dataApi.replace(/{([^}]+)}/g,  function(full, sym){
              return params[sym];
            });
            Loader.get(uri, function(err, data){
              app.displayPage(id, err||data);
            });
          }:function(params){
            app.displayPage(id);
          }
        }
      })(e[i].getAttribute('id'), e[i].getAttribute('nav'), e[i].getAttribute('data-api'))
    );
  }

  nav
    .change(function(params, old){
      app.displayPage('loading');
      nav.resolve();
      return this.defer;
    })
    .otherwise('/');
    ;
  nav.go();
};

module.exports = new Application();

},{"../lib/controllers.js":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../lib/handlebarsHelpers.js":"/home/jdarling/rock/examples/web/web/src/lib/handlebarsHelpers.js","../lib/loader.js":"/home/jdarling/rock/examples/web/web/src/lib/loader.js","../lib/partials.js":"/home/jdarling/rock/examples/web/web/src/lib/partials.js","../lib/support.js":"/home/jdarling/rock/examples/web/web/src/lib/support.js"}],"./web/src/js/controllers/charts/barchartcontroller.js":[function(require,module,exports){
var Bar = require('../../charts/bar.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;
var Support = require('../../../lib/support.js');
var el = Support.el;
var els = Support.els;

var BarChartController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= Bar();
  applyChartConfiguration('chart', container, self.chart, ['width', 'height', 'identity', 'duration', 'style']);
  if(!data){
    try{
      var src = container.innerText;
      if(src){
        var f = new Function('return '+src+';');
        data = f();
      }
      container.innerHTML = '';
    }catch(e){
      console.log(e);
    }
  }
  if(data){
    self.update(data);
  }
};

BarChartController.prototype.update = function(data){
  var self = this;
  self.data = data = data || self.data;
  if(!data){
    return;
  }
  d3.select(self.container)
    .datum(data)
    .call(self.chart)
    ;
};

require('../../../lib/controllers.js').register('BarChart', BarChartController);

},{"../../../lib/charts":"/home/jdarling/rock/examples/web/web/src/lib/charts.js","../../../lib/controllers.js":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../../lib/support.js":"/home/jdarling/rock/examples/web/web/src/lib/support.js","../../charts/bar.js":"/home/jdarling/rock/examples/web/web/src/js/charts/bar.js"}],"./web/src/js/controllers/charts/linechartcontroller.js":[function(require,module,exports){
var Line = require('../../charts/line.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var LineChartController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= Line();
  applyChartConfiguration('chart', container, self.chart, ['width', 'height', 'identity', 'duration', 'style']);
  if(!data){
    try{
      var src = container.innerText;
      if(src){
        var f = new Function('return '+src+';');
        data = f();
      }
      container.innerHTML = '';
    }catch(e){
      console.log(e);
    }
  }
  if(data){
    self.update(data);
  }
};

LineChartController.prototype.update = function(data){
  var self = this;
  self.data = data = data || self.data;
  if(!data){
    return;
  }
  d3.select(self.container)
    .datum(data)
    .call(self.chart)
    ;
};

require('../../../lib/controllers').register('LineChart', LineChartController);

},{"../../../lib/charts":"/home/jdarling/rock/examples/web/web/src/lib/charts.js","../../../lib/controllers":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../charts/line.js":"/home/jdarling/rock/examples/web/web/src/js/charts/line.js"}],"./web/src/js/controllers/charts/mindmapcontroller.js":[function(require,module,exports){
var MindMap = require('../../charts/mindmap.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var MindMapController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= MindMap();
  applyChartConfiguration('mm', container, self.chart, ['width', 'height', 'identity', 'duration', 'style']);
  if(!data){
    try{
      var src = container.innerText;
      if(src){
        var f = new Function('return '+src+';');
        data = f();
      }
      container.innerHTML = '';
    }catch(e){
      console.log(e);
    }
  }
  if(data){
    self.update(data);
  }
  self.dataAttributePrefix = 'mm';
};

MindMapController.prototype.update = function(data){
  var self = this;
  self.data = data = data || self.data;
  if(!data){
    return;
  }
  d3.select(self.container)
    .datum(data)
    .call(self.chart)
    ;
};

require('../../../lib/controllers').register('MindMap', MindMapController);

},{"../../../lib/charts":"/home/jdarling/rock/examples/web/web/src/lib/charts.js","../../../lib/controllers":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../charts/mindmap.js":"/home/jdarling/rock/examples/web/web/src/js/charts/mindmap.js"}],"./web/src/js/controllers/charts/piechartcontroller.js":[function(require,module,exports){
var Pie = require('../../charts/pie.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var PieChartController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= Pie();
  applyChartConfiguration('chart', container, self.chart, ['width', 'height', 'identity', 'duration', 'style']);
  if(!data){
    try{
      var src = container.innerText;
      if(src){
        var f = new Function('return '+src+';');
        data = f();
      }
      container.innerHTML = '';
    }catch(e){
      console.log(e);
    }
  }
  if(data){
    self.update(data);
  }
};

PieChartController.prototype.update = function(data){
  var self = this;
  self.data = data = data || self.data;
  if(!data){
    return;
  }
  d3.select(self.container)
    .datum(data)
    .call(self.chart)
    ;
};

require('../../../lib/controllers').register('PieChart', PieChartController);

},{"../../../lib/charts":"/home/jdarling/rock/examples/web/web/src/lib/charts.js","../../../lib/controllers":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../charts/pie.js":"/home/jdarling/rock/examples/web/web/src/js/charts/pie.js"}],"./web/src/js/controllers/charts/scatterchartcontroller.js":[function(require,module,exports){
var Scatter = require('../../charts/scatter.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var ScatterChartController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= Scatter();
  applyChartConfiguration('chart', container, self.chart, ['width', 'height', 'identity', 'duration', 'style']);
  if(!data){
    try{
      var src = container.innerText;
      if(src){
        var f = new Function('return '+src+';');
        data = f();
      }
      container.innerHTML = '';
    }catch(e){
      console.log(e);
    }
  }
  if(data){
    self.update(data);
  }
};

ScatterChartController.prototype.update = function(data){
  var self = this;
  self.data = data = data || self.data;
  if(!data){
    return;
  }
  if(data[0] instanceof Array){
    var tmp = [];
    var i, l = data.length, j, k, v;
    for(i=0; i<l; i++){
      k = data[i].length;
      for(j=0; j<k; j++){
        v = data[i][j];
        v.x = i;
        v.y = v.value;
        tmp.push(v);
      }
    }
    data = tmp;
  }
  d3.select(self.container)
    .datum(data)
    .call(self.chart)
    ;
};

require('../../../lib/controllers').register('ScatterChart', ScatterChartController);

},{"../../../lib/charts":"/home/jdarling/rock/examples/web/web/src/lib/charts.js","../../../lib/controllers":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../charts/scatter.js":"/home/jdarling/rock/examples/web/web/src/js/charts/scatter.js"}],"./web/src/js/controllers/charts/tableviewcontroller.js":[function(require,module,exports){
var Table = require('../../charts/table.js');
var applyChartConfiguration = require('../../../lib/charts').applyChartConfiguration;

var TableViewController = function(container, data){
  var self = this;
  self.container = container;
  self.chart= Table();
  applyChartConfiguration('table', container, self.chart, ['cols', 'width', 'height', 'identity', 'duration', 'style']);
  self.chart
    .updated(function(vis){
      vis.attr('class', 'ink-table');
    })
    ;
  if(!data){
    try{
      var src = container.innerText;
      if(src){
        var f = new Function('return '+src+';');
        data = f();
      }
      container.innerHTML = '';
    }catch(e){
      console.log(e);
    }
  }
  if(data){
    self.update(data);
  }
  self.dataAttributePrefix = 'table';
};

TableViewController.prototype.update = function(data){
  var self = this;
  var isAllArray = function(isArray, toCheck){
    return isArray && (toCheck instanceof Array);
  };
  self.data = data = data || self.data;
  if(!data){
    return;
  }
  if(data[0] instanceof Array && data.reduce(isAllArray,  true)){
    tmp = [];
    while(data.length){
      tmp = tmp.concat(data.shift());
    }
    data = tmp;
  }
  d3.select(self.container)
    .datum(data)
    .call(self.chart)
    ;
};

require('../../../lib/controllers').register('TableView', TableViewController);

},{"../../../lib/charts":"/home/jdarling/rock/examples/web/web/src/lib/charts.js","../../../lib/controllers":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../charts/table.js":"/home/jdarling/rock/examples/web/web/src/js/charts/table.js"}],"./web/src/js/controllers/codemirror.js":[function(require,module,exports){
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

},{"../../lib/controllers.js":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../lib/support":"/home/jdarling/rock/examples/web/web/src/lib/support.js"}],"./web/src/js/controllers/highlight.js":[function(require,module,exports){
var controllers = require('../../lib/controllers.js');
var support = require('../../lib/support');
var el = support.el;
var els = support.els;

var HighlightController = function(container, data){
  var self = this;
  var overHandler = self.overHandler = function(e){
    if(e.target && e.target.dataset.highlight){
      var elems = els(container, e.target.dataset.highlight);
      elems.forEach(function(elem){
        elem.className = (elem.className+' highlight').trim();
      });
    }
  };
  var outHandler = self.overHandler = function(e){
    if(e.target && e.target.dataset.highlight){
      var elems = els(container, '.highlight');
      elems.forEach(function(elem){
        elem.className = (elem.className.replace(/(\s|^)highlight(\s|$)/, ' ')).trim();
      });
    }
  };
  container.addEventListener('mouseover', overHandler);
  container.addEventListener('mouseout', outHandler);
};

HighlightController.prototype.teardown = function(container){
  var self = this;
  container.addEventListener('mouseover', self.overHandler);
  container.addEventListener('mouseout', self.outHandler);
};

controllers.register('Highlight', HighlightController);

},{"../../lib/controllers.js":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../lib/support":"/home/jdarling/rock/examples/web/web/src/lib/support.js"}],"./web/src/js/controllers/markdown.js":[function(require,module,exports){
var controllers = require('../../lib/controllers.js');
var Support = require('../../lib/support.js');
var el = Support.el;
var els = Support.els;

(function(){
  var chart = function(converter){
    return [
      {
        type: 'lang',
        regex: '@@chart=(.+)([\\s\\S]*?)@@chart',
        replace: function(match, chartType, source){
          //console.log('Chart: ', arguments);
          var parts = source.split('@@data');
          var args = parts.length>1?parts.shift():'';
          var vargs = '';
          source = parts.shift();
          args = args.split(/[\r\n]+/);
          var i=0, l=args.length;
          for(i=0; i<l;){
            if(!args[i].trim()){
              args.splice(i,1);
              l--;
            }else if(args[i].substr(-1)==='/'){
              args[i]=args[i].substr(0, args[i].length-1)+'\n'+args.splice(i+1,1);
              l--;
            }else{
              i++;
            }
          }
          args.forEach(function(set){
            var parts = set.split('=');
            if(parts.length>1){
              vargs += parts.shift()+'="'+parts.join('=')+'"';
            }
          });
          return '<div data-controller="'+chartType+'"'+vargs+'>'+source+'</div>';
        }
      }
    ];
  };

  if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.chart = chart; }
})();

var markdown = new Showdown.converter({ extensions: ['chart'] });

var MarkdownController = function(container, data){
  var self = this;
  var content = container.innerHTML;
  var frag = document.createDocumentFragment();
  container.innerHTML = markdown.makeHtml(content);
  setTimeout(function(){
    var elm, elms = els(container, '[data-controller]'), i, l=elms.length;
    for(i=0; i<l; i++){
      elm = elms[i];
      controllerName = elm.getAttribute('data-controller');
      controllers.create(elm, controllerName, data);
    }
  }, 10);
};

controllers.register('Markdown', MarkdownController);

},{"../../lib/controllers.js":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../lib/support.js":"/home/jdarling/rock/examples/web/web/src/lib/support.js"}],"./web/src/js/controllers/pincontroller.js":[function(require,module,exports){
var controllers = require('../../lib/controllers.js');
var handlebarsHelpers = require('../../lib/handlebarsHelpers');
var support = require('../../lib/support');
var Loader = require('../../lib/loader');
var sockets = require('../../lib/sockets');

var PinController = function(container, data){
  var self = this;
  var findPin = function(pinNumber){
    var i=0, l=data.length;
    while(i<l){
      if(data[i].pin === pinNumber){
        return i;
      }
      i++;
    }
    return -1;
  };
  var idx = container.dataset.index||findPin(+container.dataset.pin);
  var template = Handlebars.compile(container.innerHTML);
  var oldValue, pin;
  var refresh = function(data){
    pin = data;
    oldValue = pin.value;
    container.innerHTML = template(data, {helpers: handlebarsHelpers});
  };
  var changeHandler = self.changeHandler = function(e){
    if(e.target && e.target.nodeName === 'SELECT'){
      var target = (e.target.dataset.api||'').replace('{value}', support.val(e.target).toLowerCase());
      Loader.post(target, function(err, data){
        if(err){
          return alert(err);
        }
      });
    }
  };
  var pinChanged = self.pinChanged = function(value){
    pin.value = value;
    refresh(pin);
  };
  container.addEventListener('change', changeHandler);
  refresh(data[idx]);
  sockets.on('pin'+pin.pin+':change', pinChanged);
  self.pin = pin.pin;
};

PinController.prototype.teardown = function(container){
  var self = this;
  container.removeEventListener('change', self.changeHandler);
  sockets.removeListener('pin'+self.pin+':change', self.pinChanged);
};

controllers.register('PinController', PinController);

},{"../../lib/controllers.js":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../lib/handlebarsHelpers":"/home/jdarling/rock/examples/web/web/src/lib/handlebarsHelpers.js","../../lib/loader":"/home/jdarling/rock/examples/web/web/src/lib/loader.js","../../lib/sockets":"/home/jdarling/rock/examples/web/web/src/lib/sockets.js","../../lib/support":"/home/jdarling/rock/examples/web/web/src/lib/support.js"}],"./web/src/js/controllers/pinfilter.js":[function(require,module,exports){
var controllers = require('../../lib/controllers.js');
var handlebarsHelpers = require('../../lib/handlebarsHelpers');
var support = require('../../lib/support');
var Loader = require('../../lib/loader');
var els = support.els;
var el = support.el;

var PinFilterController = function(container, data){
  var self = this;
  var filterList = function(src){
    var re = new RegExp(src, 'gi');
    var boxes = els(container.parentNode, '[data-pins]');
    boxes.forEach(function(box){
      var pins = box.dataset.pins.split(',').map(function(s){
        return s.trim();
      }).join('\n');
      box.className = box.className.replace(/(^|\W+)hidden(\W+|$)/gi, '').trim();
      els(box, 'select').forEach(function(elem){
        if(elem.selectedIndex !== -1){
          pins += '\n'+elem.options[elem.selectedIndex].text;
        }
      });
      if(src && !pins.match(re)){
        box.className = box.className + ' hidden';
      }
    });
  };
  var clickHandler = self.clickHandler = function(e){
    if(e.target && e.target.nodeName === 'BUTTON'){
      var val = support.val(el(container, '[role="search"] input'));
      filterList(val);
      e.preventDefault();
      return false;
    }
  };
  var keyHandler = self.keyHandler = function(e){
    var code = e.key||e.keyCode;
    if(!e.target){
      return;
    }
    filterList(support.val(e.target));
    if(code === 13){
      e.preventDefault();
      return false;
    }
  };
  container.addEventListener('click', clickHandler);
  container.addEventListener('keyup', keyHandler);
};

PinFilterController.prototype.teardown = function(container){
  var self = this;
  container.removeEventListener('click', self.clickHandler);
  container.removeEventListener('keyup', self.keyHandler);
};

controllers.register('PinFilter', PinFilterController);

},{"../../lib/controllers.js":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../lib/handlebarsHelpers":"/home/jdarling/rock/examples/web/web/src/lib/handlebarsHelpers.js","../../lib/loader":"/home/jdarling/rock/examples/web/web/src/lib/loader.js","../../lib/support":"/home/jdarling/rock/examples/web/web/src/lib/support.js"}],"./web/src/js/controllers/scripteditor.js":[function(require,module,exports){
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
        alert('Running...');
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

},{"../../lib/controllers.js":"/home/jdarling/rock/examples/web/web/src/lib/controllers.js","../../lib/handlebarsHelpers":"/home/jdarling/rock/examples/web/web/src/lib/handlebarsHelpers.js","../../lib/loader":"/home/jdarling/rock/examples/web/web/src/lib/loader.js","../../lib/support":"/home/jdarling/rock/examples/web/web/src/lib/support.js"}],"/home/jdarling/rock/examples/web/web/src/js/charts/bar.js":[function(require,module,exports){
module.exports = function Bar() {
  var
      margin = {top: 30, right: 10, bottom: 50, left: 50},
      width = -1,
      height = 420,
      xRoundBands = 0.2,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.scale.ordinal(),
      yScale = d3.scale.linear(),
      yAxis = d3.svg.axis().scale(yScale).orient("left"),
      xAxis = d3.svg.axis().scale(xScale),
      xAxisBottom = d3.svg.axis().scale(xScale),
      style = false,
      onUpdate = false,
      duration = 500,
      getColor = false,
      container,
      enterBar = function(bar){
        bar = bar.append("rect")
          .attr("class", function(d, i) { return yValue(d) < 0 ? "negative" : "positive"; })
          ;
        if(getColor){
          bar.style('fill', getColor);
        }
      },
      updateBar = function(bar){
        bar.select('rect')
          .attr("class", function(d) { return yValue(d) < 0 ? "negative" : "positive"; })
          .attr("x", function(d) { return X(d); })
          .attr("y", function(d) { return yValue(d) < 0 ? Y0() : Y(d); })
          .attr("width", xScale.rangeBand())
          .attr("height", function(d, i) { return Math.abs( Y(d) - Y0() ); })
          ;
      },
      exitBar = function(bar){
      }
      ;

  function chart(selection) {
    selection.each(function(data) {
      var w = width===-1?this.offsetWidth:width;
      // Update the x-scale.
      xScale
          .domain(data.map(xValue))
          .rangeRoundBands([0, w - margin.left - margin.right], xRoundBands);

      var ys = d3.extent(data.map(yValue));
      if(ys[0]>0){
        ys[0] = 0;
      }
      // Update the y-scale.
      yScale
          .domain(ys)
          .range([height - margin.top - margin.bottom, 0])
          .nice();

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "bars");
      gEnter.append("g").attr("class", "y axis");
      gEnter.append("g").attr("class", "x axis bottom");
      gEnter.append("g").attr("class", "x axis zero");

      // Update the outer dimensions.
      svg .attr("width", w)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     // Update the bars.
      var bars = svg.select(".bars");//.selectAll(".bar");//.data(data);
      var bar = bars.selectAll('g.bar').data(data);

      var barEnter = bar.enter()
        .append("g")
        .attr('class', 'bar')
        ;
      enterBar(barEnter);
      updateBar(bar.transition().duration(duration));
      var barExit = bar.exit()
        .remove()
        ;
      exitBar(barExit);

    // x axis at the bottom of the chart
    g.select(".x.axis.bottom")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
        .call(xAxisBottom.orient("bottom"));
    // zero line
     g.select(".x.axis.zero")
        .attr("transform", "translate(0," + Y0() + ")")
        .call(xAxis.tickFormat("").tickSize(0));

      // Update the y-axis.
      g.select(".y.axis")
        .call(yAxis);
      g.selectAll(".axis line")
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
        ;
        g.selectAll('.axis path')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
        ;
      if(style){
        var key;
        for(key in style){
          svg.selectAll(key).attr('style', style[key]);
        }
      }

      if(onUpdate){
        onUpdate(svg);
      }
    });
  }


// The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(xValue(d));
  }

  function Y0() {
    return yScale(0);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(yValue(d));
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  chart.xRoundBands = function(_) {
    if (!arguments.length) return xRoundBands;
    xRoundBands = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.barEnter = function(_){
    if (!arguments.length) return enterBar;
    enterBar = _;
    return chart;
  };

  chart.barUpdate = function(_){
    if (!arguments.length) return updateBar;
    updateBar = _;
    return chart;
  };

  chart.barExit = function(_){
    if (!arguments.length) return exitBar;
    exitBar = _;
    return chart;
  };

  chart.colorize = function(_){
    if (!arguments.length) return getColor;
    getColor = _;
    return chart;
  };

  chart.style = function(_) {
    if (!arguments.length) return style;
    style = _;
    return chart;
  };

  chart.updated = function(_){
    if (!arguments.length) return onUpdate;
    onUpdate = _;
    return chart;
  };

  chart.update = function() {
    container.transition().duration(duration).call(chart);
  };

  return chart;
};

},{}],"/home/jdarling/rock/examples/web/web/src/js/charts/line.js":[function(require,module,exports){
module.exports = function Line() {
  var
    margin = {top: 30, right: 10, bottom: 50, left: 50},
    width = -1,
    height = 420,
    duration = 500,
    xValue = function(d) { return d[0]; },
    yValue = function(d) { return d[1]; },
    xScale = d3.scale.linear(),
    yScale = d3.scale.linear(),
    yAxis = d3.svg.axis().scale(yScale).orient("left"),
    xAxis = d3.svg.axis().scale(xScale).orient("bottom"),
    getText = function(d){ return d.text||''; },
    getValue = function(d){
      return yValue(d);
    },
    line = d3.svg.line()
      .x(function(d,i) {
        return xScale(i);
      })
      .y(function(d){
        return yScale(yValue(d));
      }),
    enterSample = function(node){
      var sample = node
        .append('path').classed('line', true)
              .style({
                  fill: 'none',
                  stroke: getColor||'black'
              })
              .attr('d', d3.svg.line().x(function(d, i){return xScale(i)}).y(height))
              ;
    },
    updateSample = function(node){
      node.select('.line').attr('d', line);

      var samples = node
        .selectAll('.point')
        .data(function(d){
          return d;
        });
      var samplesEnter = samples.enter()
        .append('circle').classed('point', true)
        .style({
          fill: getColor||'black',
          stroke: getColor||'black'
        })
        .attr('transform', function(d, i) { return 'translate(' + xScale(i) + ', ' +  (height+margin.top) + ')'; })
        .attr('r', 4)
        ;

      var points = node.selectAll('.point')
        .attr('transform', function(d, i) { return 'translate(' + xScale(i) + ', ' +  yScale(yValue(d)) + ')'; })
        ;
    },
    exitSample = function(node){
    },
    xRoundBands = 0.2,
    style = false,
    onUpdate = false,
    getColor = false
    ;

  function chart(selection) {
    selection.each(function(data) {
      var wid = width===-1?this.offsetWidth:width;
      if(!(data[0] instanceof Array)){
        data = [data];
      }
      // Update the x-scale.
      xScale
          .domain([0, d3.max(data, function(series) { return series.length-1; })])
          .range([0, wid - margin.left - margin.right])
          ;

      //var ys = d3.extent(data.map(yValue));
      var ys = [
          d3.min(data, function(s) { return d3.min(s, yValue) }),
          d3.max(data, function(s) { return d3.max(s, yValue) })
        ];
      // Update the y-scale.
      yScale
          .domain(ys)
          .range([height - margin.top - margin.bottom, 0])
          .nice();

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "series");
      gEnter.append("g").attr("class", "y axis");
      gEnter.append("g").attr("class", "x axis bottom");
      gEnter.append("g").attr("class", "x axis zero");

      // Update the outer dimensions.
      svg .attr("width", wid)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var lineGroup = svg.select(".series").selectAll("g.line")
        .data(data);
      var sampleEnter = lineGroup.enter().append('g').classed('line', true);
      enterSample(sampleEnter);
      updateSample(lineGroup);
      /*
      updateSample(lineGroup.transition()
            .duration(duration));
      */
      exitSample(lineGroup.exit().remove());

      // x axis at the bottom of the chart
      g.select(".x.axis.bottom")
        .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
        .call(xAxis);

      // Update the y-axis.
      g.select(".y.axis")
        .call(yAxis);
      g.selectAll(".axis line")
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
        ;
        g.selectAll('.axis path')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
        ;
      if(style){
        var key;
        for(key in style){
          svg.selectAll(key).attr('style', style[key]);
        }
      }

      if(onUpdate){
        onUpdate(svg);
      }
    });
  };

  function X(d) {
    return xScale(xValue(d));
  }

  function Y(d) {
    return yScale(yValue(d));
  }

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.xScale = function(_) {
    if (!arguments.length) return xScale;
    xScale = _;
    return chart;
  };

  chart.yScale = function(_) {
    if (!arguments.length) return yScale;
    yScale = _;
    return chart;
  };

  chart.colorize = function(_){
    if (!arguments.length) return getColor;
    getColor = _;
    return chart;
  };

  chart.text = function(_) {
    if (!arguments.length) return getText;
    getText = _;
    return chart;
  };

  chart.value= function(_) {
    if (!arguments.length) return getValue;
    getValue = _;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.updated = function(_){
    if (!arguments.length) return onUpdate;
    onUpdate = _;
    return chart;
  };

  return chart;
};

},{}],"/home/jdarling/rock/examples/web/web/src/js/charts/mindmap.js":[function(require,module,exports){
/*
  Sample Usage:

  var myData = {
    'name': 'Root',
    'children': [
      {
        'name': 'Branch 1',
        'children': [
          {'name': 'Leaf 3'},
          {'name': 'Leaf 4'}
        ]
      },
      {'name': 'Branch 2'}
    ]
  };

  var chart = MindMap()
    .width(900)
    .height(500)
    ;

  d3.select('#chart svg')
    .datum(myData)
    .call(chart)
    ;
*/

var MindMap = module.exports = function(){
  'use strict';
  var
      margin = {top: 20, left: 120, bottom: 20, right: 120},
      width = -1,
      height = 500,
      duration = 500,
      identity = '_id',
      handleClick = function(){},
      text = function(d){ return d.name; },
      idx = 1,
      style = false,
      onUpdate = false,
      enterNode = function(node){
        node.append('svg:circle')
            .attr('r', 1e-6);

        node.append('svg:text')
            .attr('text-anchor', 'middle')
            .attr('dy', 14)
            .text(text)
            .style('fill-opacity', 1);
      },
      updateNode = function(node){
        node.select('text')
          .text(text);

        node.select('circle')
            .attr('r', 4.5);
      },
      exitNode = function(node){
        node.select('circle')
            .attr('r', 1e-6);

        node.select('text')
            .style('fill-opacity', 1e-6);
      }
    ;

  var connector = MindMap.elbow;

  var chart = function(selection){
    selection.each(function(root){
      var wid = width===-1?this.offsetWidth:width;
      var w = wid - margin.left - margin.right;
      var h = height - margin.top - margin.bottom;
      var container = d3.select(this);
      var vis = d3.select(this).select('svg');
      if(!vis[0][0]){
        vis = d3.select(this).append('svg');
      }
      vis
        .attr('width', wid)
        .attr('height', height)
        ;

      var graphRoot = vis.select('g');
      if(!graphRoot[0][0]){
        vis = vis.append('svg:g');
      }else{
        vis = graphRoot;
      }
      vis = vis
      .attr('transform', 'translate(' + (w/2+margin.left) + ',' + margin.top + ')')
      ;

      root.x0 = h / 2;
      root.y0 = 0;

      var tree = d3.layout.tree()
          .size([h, w]);

      chart.update = function() { container.transition().duration(duration).call(chart); };

      // Ensure we have Left and Right node lists
      if(!(root.left || root.right)){
        var i=0, l = (root.children||[]).length;
        root.left = [];
        root.right = [];
        for(; i<l; i++){
          if(i%2){
            root.left.push(root.children[i]);
            root.children[i].position = 'left';
          }else{
            root.right.push(root.children[i]);
            root.children[i].position = 'right';
          }
        }
      }

      // Compute the new tree layout.
      var nodesLeft = tree
        .size([h, (w/2)-20])
        .children(function(d){
          return (d.depth===0)?d.left:d.children;
        })
        .nodes(root)
        .reverse();
      var nodesRight = tree
        .size([h, w/2])
        .children(function(d){
          return (d.depth===0)?d.right:d.children;
        })
        .nodes(root)
        .reverse();
      root.children = root.left.concat(root.right);
      var nodes = window.nodes = (function(left, right){
        var root = right[right.length-1];
        left.pop();
        left.forEach(function(node){
          node.y = -node.y;
          node.parent = root;
          node.position = 'left';
        });
        right.forEach(function(node){
          node.position = 'right';
        });
        root.position = 'root';
        return left.concat(right);
      })(nodesLeft, nodesRight);

      // Update the nodes…
      var node = vis.selectAll('g.node')
          .data(nodes, function(d) { return d[identity] || (d[identity] = ++idx); });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append('svg:g')
          .attr('class', 'node')
          .attr('position', function(d){
            return d.position;
          })
          .attr('transform', function(d) {
            return 'translate(' + root.y0 + ',' + root.x0 + ')';
          })
          .on('click', handleClick);


      enterNode(nodeEnter);

      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
          .duration(duration)
          .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });


      updateNode(nodeUpdate);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr('transform', function() { return 'translate(' + root.y + ',' + root.x + ')'; })
          .remove();

      exitNode(nodeExit);

      // Update the links…
      var link = vis.selectAll('path.link')
          .data(tree.links(nodes), function(d) { return d.target[identity]; });

      // Enter any new links at the parent's previous position.
      link.enter().insert('svg:path', 'g')
          .attr('class', 'link')
          .attr('d', function() {
            var o = {x: root.x0, y: root.y0};
            return connector({source: o, target: o});
          })
          .style({
            fill: 'none',
            stroke: '#ccc',
            'stroke-width': '1.5px'
          })
        .transition()
          .duration(duration)
          .attr('d', connector);

      // Transition links to their new position.
      link.transition()
          .duration(duration)
          .attr('d', connector);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
          .duration(duration)
          .attr('d', function() {
            var o = {x: root.x, y: root.y};
            return connector({source: o, target: o});
          })
          .remove();

      // Stash the old positions for transition.
      nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      if(style){
        var key;
        for(key in style){
          vis.selectAll(key).attr('style', style[key]);
        }
      }

      if(onUpdate){
        onUpdate(vis);
      }
    });
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  chart.connector = function(_) {
    if (!arguments.length) return connector;
    connector = _;
    return chart;
  };

  chart.click = function(_) {
    if (!arguments.length) return handleClick;
    handleClick = _;
    return chart;
  };

  chart.identity = function(_) {
    if (!arguments.length) return identity;
    identity = _;
    return chart;
  };

  chart.text = function(_) {
    if (!arguments.length) return text;
    text = _;
    return chart;
  };

  chart.nodeEnter = function(_){
    if (!arguments.length) return enterNode;
    enterNode = _;
    return chart;
  };

  chart.nodeUpdate = function(_){
    if (!arguments.length) return updateNode;
    updateNode = _;
    return chart;
  };

  chart.nodeExit = function(_){
    if (!arguments.length) return exitNode;
    exitNode = _;
    return chart;
  };

  chart.style = function(_) {
    if (!arguments.length) return style;
    style = _;
    return chart;
  };

  chart.updated = function(_){
    if (!arguments.length) return onUpdate;
    onUpdate = _;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  return chart;
};

MindMap.elbow = function (d){
  var source = d.source;
  var target = d.target;
  var hy = (target.y-source.y)/2;
  return 'M' + source.y + ',' + source.x +
         'H' + (source.y+hy) +
         'V' + target.x + 'H' + target.y;
};

MindMap.loadFreeMind = function(fileName, callback){
  d3.xml(fileName, 'application/xml', function(err, xml){
    // Changes XML to JSON
    var xmlToJson = function(xml) {

      // Create the return object
      var obj = {};

      if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
        obj['@attributes'] = {};
          for (var j = 0; j < xml.attributes.length; j++) {
            var attribute = xml.attributes.item(j);
            obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
          }
        }
      } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
      }

      // do children
      if (xml.hasChildNodes()) {
        for(var i = 0; i < xml.childNodes.length; i++) {
          var item = xml.childNodes.item(i);
          var nodeName = item.nodeName;
          if (typeof(obj[nodeName]) == 'undefined') {
            obj[nodeName] = xmlToJson(item);
          } else {
            if (typeof(obj[nodeName].push) == 'undefined') {
              var old = obj[nodeName];
              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(xmlToJson(item));
          }
        }
      }
      return obj;
    };
    var js = xmlToJson(xml);
    var data = js.map.node;
    var parseData = function(data, direction){
      var key, i, l, dir = direction, node = {}, child;
      for(key in data['@attributes']){
        node[key.toLowerCase()] = data['@attributes'][key];
      }
      node.direction = node.direction || dir;
      l = (data.node || []).length;
      if(l){
        node.children = [];
        for(i=0; i<l; i++){
          dir = data.node[i]['@attributes'].POSITION || dir;
          child = parseData(data.node[i], {}, dir);
          (node[dir] = node[dir] || []).push(child);
          node.children.push(child);
        }
      }
      return node;
    };
    var root = parseData(data, 'right');

    return callback(err, root);
  });
};

},{}],"/home/jdarling/rock/examples/web/web/src/js/charts/pie.js":[function(require,module,exports){
var Pie = module.exports = function(){
  var
      margin = {top: 20, left: 50, bottom: 20, right: 20},
      width = -1,
      height = 500,
      duration = 500,
      identity = '_id',
      idx = 1,
      ir = 0,
      style = false,
      onUpdate = false,
      container,
      getValue = function x(d){
        return +d.value;
      },
      colorRange = false,
      getColor = function(d){
        return colorRange(getValue(d));
      },
      getText = function(d){
        return d.text||'';
      },
      getIdentity = function(d){
        return d.data[identity] || (d.data[identity] = ++idx);
      },
      enterSlice = function(node, arc){
        node.append('path')
          .style('fill', function(d){
            return getColor(d.data);
          })
          ;
        node.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .text(function(d) { return getText(d.data); });
      },
      updateSlice = function(node, arc){
        node.select('path')
          .style('fill', function(d){
            return getColor(d.data);
          })
          .attrTween('d', function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
              return arc(interpolate(t));
            };
          });
        node.select('text')
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .text(function(d) { return getText(d.data); });
      },
      exitSlice = function(node, arc){
      }
  ;

  var chart = function(selection){
    container = selection;
    selection.each(function(data){
      var wid = width===-1?this.offsetWidth:width;
      var w = wid - margin.left - margin.right;
      var h = height - margin.top - margin.bottom;
      var r = (w>h)?Math.floor(h/2):Math.floor(w/2);
      var vis = d3.select(this).select('svg');
      var min = d3.min(data, getValue), max = d3.max(data, getValue);
      var i=0, l=data.length;
      for(;i<l; i++){
        data[i][identity] = data[i][identity] || idx++;
      }
      colorRange = d3.scale.linear().domain([min, max]).range(["#ddd", "#333"]);

      if(!vis[0][0]){
        vis = d3.select(this).append('svg');
      }
      vis
        .attr('width', wid)
        .attr('height', height)
        ;

      var arc = d3.svg.arc()
          .outerRadius(r)
          .innerRadius(ir);

      var pie = d3.layout.pie()
          .value(getValue);

      var main = vis.select('g');
      var slices = main.select('.slices');
      if(!main[0][0]){
        main = vis.append('g');
        slices = main.append('g').attr('class', 'slices');
      }
      main
        .attr('transform', 'translate('+(margin.left+(w/2))+', '+(margin.top+(h/2))+')')
        ;

      var slice = slices.selectAll('g.slice')
        .data(pie(data, getIdentity));
        ;

      var sliceEnter = slice.enter()
        .append('g')
        .attr('class', 'slice')
        ;
      enterSlice(sliceEnter, arc);

      updateSlice(slice.transition().duration(duration), arc);

      var sliceExit = slice.exit()
        .remove()
        ;

      exitSlice(sliceExit);

      if(style){
        var key;
        for(key in style){
          vis.selectAll(key).attr('style', style[key]);
        }
      }

      if(onUpdate){
        onUpdate(vis);
      }
    });
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.value = function(_) {
    if (!arguments.length) return getValue;
    getValue = _;
    return chart;
  };

  chart.text = function(_) {
    if (!arguments.length) return getText;
    getText = _;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  chart.identity = function(_) {
    if (!arguments.length) return identity;
    identity = _;
    return chart;
  };

  chart.innerRadius = function(_){
    if (!arguments.length) return ir;
    ir = _;
    return chart;
  };

  chart.style = function(_) {
    if (!arguments.length) return style;
    style = _;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.updated = function(_){
    if (!arguments.length) return onUpdate;
    onUpdate = _;
    return chart;
  };

  chart.colorize = function(_){
    if (!arguments.length) return getColor;
    getColor = _;
    return chart;
  };

  chart.refresh = function() {
  };
  chart.update = function() {
    container.transition().duration(duration).call(chart);
  };

  return chart;
};

},{}],"/home/jdarling/rock/examples/web/web/src/js/charts/scatter.js":[function(require,module,exports){
var Scatter = module.exports = function(){
  var
      margin = {top: 20, left: 50, bottom: 20, right: 20},
      width = -1,
      height = 500,
      duration = 500,
      showXAxis = true,
      showYAxis = true,
      identity = '_id',
      idx = 1,
      style = false,
      onUpdate = false,
      getColor = false,
      getX = function x(d){
        return d.x;
      },
      getY = function y(d){
        return d.y;
      },
      getR = function(d){
        return 8;
      },
      getScaleX = function(data, w){
        var min = d3.min(data, getX), max = d3.max(data, getX);
        var r = ((max - min) * 0.1) || 1;
        min -= r;
        max += r;
        return d3.scale.linear()
          .domain([min, max])
          .range([0, w])
          ;
      },
      getScaleY = function(data, h){
        var min = d3.min(data, getY), max = d3.max(data, getY);
        var r = ((max - min) * 0.1) || 1;
        min -= r;
        max += r;
        return d3.scale.linear()
          .domain([max, min])
          .range([0,h])
          ;
      },
      getColor = function(d){
        return 'black';
      },
      getText = function(d){ return d.text||''; },
      enterNode = function(node){
        var circle = node.append('svg:circle')
            .attr('r', 1e-6);

        if(getColor){
          circle.style('fill', getColor);
        }

        node.append('svg:text')
            .attr('text-anchor', 'middle')
            .attr('dy', function(d){return -getR(d)-3})
            .text(getText)
            .style('fill-opacity', 1);
      },
      updateNode = function(node){
        node.select('text')
          .text(getText);

        node.select('circle')
            .attr('r', getR);
      },
      exitNode = function(node){
        node.select('circle')
            .attr('r', 1e-6);

        node.select('text')
            .style('fill-opacity', 1e-6);
      }
  ;

  var chart = function(selection){

    selection.each(function(data){
      var wid = width===-1?this.offsetWidth:width;
      var w = wid - margin.left - margin.right;
      var h = height - margin.top - margin.bottom;
      var vis = d3.select(this).select('svg');
      var x = getScaleX(data, w);
      var y = getScaleY(data, h);

      if(showXAxis){
        var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')
          ;
      }
      if(showYAxis){
        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          ;
      }

      if(!vis[0][0]){
        vis = d3.select(this).append('svg');
      }
      vis
        .attr('width', wid)
        .attr('height', height)
        ;

      var node = vis.selectAll('g.node')
          .data(data, function(d) { return d[identity] || (d[identity] = ++idx); })
          ;
      var nodeEnter = node.enter().append('svg:g')
          .attr('class', 'node')
          .attr('transform', function(d, i) {
            return 'translate(' + (x(getX(d, i)) + margin.left) + ',' +  (margin.top+h)  + ')';
          })
          ;
      enterNode(nodeEnter);

      var nodeUpdate = node.transition()
          .duration(duration)
          .attr('transform', function(d, i) { return 'translate(' + (x(getX(d, i)) + margin.left) + ', ' +  (y(getY(d, i)) + margin.top) + ')'; })
          ;

      updateNode(nodeUpdate);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr('transform', function(d, i) { return 'translate(' + (x(getX(d, i)) + margin.left) + ', ' +  (margin.top+h) + ')'; })
          .remove()
          ;

      exitNode(nodeExit);

      if(showXAxis){
        var xA = vis.select('g.xAxis');
        if(!xA[0][0]){
          xA = vis.append('g')
            .attr('class', 'axis xAxis')
            .attr('transform', 'translate(' + margin.left + ',' + (h+margin.top) + ')')
            .call(xAxis)
            ;
        }else{
          xA.transition()
            .duration(duration)
            .call(xAxis)
            ;
        }
        xA.selectAll('line')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
          ;
        xA.selectAll('path')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
          ;
      }

      if(showYAxis){
        var yA = vis.select('g.yAxis');
        if(!yA[0][0]){
          yA = vis.append('g')
            .attr('class', 'axis yAxis')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(yAxis)
            ;
        }else{
          yA.transition()
            .duration(duration)
            .call(yAxis)
            ;
        }
        yA.selectAll('line')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
          ;
        yA.selectAll('path')
          .attr('style', 'shape-rendering: crispEdges; stroke: black; fill: none;')
          ;
      }

      if(style){
        var key;
        for(key in style){
          vis.selectAll(key).attr('style', style[key]);
        }
      }

      if(onUpdate){
        onUpdate(vis);
      }
    });
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return getX;
    getX = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return getY;
    getY = _;
    return chart;
  };

  chart.text = function(_) {
    if (!arguments.length) return getText;
    getText = _;
    return chart;
  };

  chart.size = function(_) {
    if (!arguments.length) return getR;
    if(typeof(_)==='function'){
      getR = _;
    }else{
      getR = function(){
        return _;
      }
    }
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  chart.identity = function(_) {
    if (!arguments.length) return identity;
    identity = _;
    return chart;
  };

  chart.style = function(_) {
    if (!arguments.length) return style;
    style = _;
    return chart;
  };

  chart.xAxis = function(_){
    if (!arguments.length) return showXAxis;
    showXAxis = !!_;
    return chart;
  };

  chart.yAxis = function(_){
    if (!arguments.length) return showYAxis;
    showYAxis = !!_;
    return chart;
  };

  chart.scaleX = function(_) {
    if (!arguments.length) return getScaleX;
    getScaleX = _;
    return chart;
  };

  chart.scaleY = function(_) {
    if (!arguments.length) return getScaleY;
    getScaleY = _;
    return chart;
  };

  chart.nodeEnter = function(_){
    if (!arguments.length) return enterNode;
    enterNode = _;
    return chart;
  };

  chart.nodeUpdate = function(_){
    if (!arguments.length) return updateNode;
    updateNode = _;
    return chart;
  };

  chart.nodeExit = function(_){
    if (!arguments.length) return exitNode;
    exitNode = _;
    return chart;
  };

  chart.colorize = function(_){
    if (!arguments.length) return getColor;
    getColor = _;
    return chart;
  };

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
    margin.right  = typeof _.right  != 'undefined' ? _.right  : margin.right;
    margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
    margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
    return chart;
  };

  chart.updated = function(_){
    if (!arguments.length) return onUpdate;
    onUpdate = _;
    return chart;
  };

return chart;
};

},{}],"/home/jdarling/rock/examples/web/web/src/js/charts/table.js":[function(require,module,exports){
var Table = module.exports = function(){
  var
      width = -1,
      height = -1,
      identity = '_id',
      idx = 1,
      duration = 500,
      style = false,
      onUpdate = false,
      cols = [],
      cellEnter = function(cell, cols){
      },
      cellUpdate = function(cell, cols){
        cell
          .html(function(d){
            var data = this.parentNode.__data__;
            var key = d.value||d;
            if(typeof(key)==='function'){
              return key(data);
            }
            return data[key];
          })
          ;
      },
      cellExit = function(){
      },
      headerEnter = function(th, cols){
      },
      headerUpdate = function(th, cols){
        th
          .text(function(col){
            return col.title||col.value||col;
          })
      },
      headerExit = function(){
      }
      ;
  var chart = function(selection){
    selection.each(function(data){
      var colHeaders = cols;
      var vis = d3.select(this).select('table');
      var thead = vis.select('thead')
            tbody = vis.select('tbody');
      var i=0, l=data.length;
      for(;i<l; i++){
        data[i][identity] = data[i][identity] || idx++;
      }
      if(!vis[0][0]){
        vis = d3.select(this).append('table');
        vis
          .attr('cellspacing', 0)
          .attr('cellpadding', 0)
          ;
        thead = vis.append('thead');
        tbody = vis.append('tbody');
      }
      if(width>-1){
        vis
          .attr('width', width)
          ;
      }
      if(height>-1){
        vis
          .attr('height', height)
          ;
      }

      if(colHeaders.length===0 && data.length){
        colHeaders = Object.keys(data[0]);
      }

      var th = thead.select('tr');
      if(!th[0][0]){
        th = thead.append('tr');
      }
      var th = th
        .selectAll('th')
        .data(colHeaders)
        ;
      var thEnter = th
        .enter()
        .append('th')
        ;
      headerEnter(thEnter, colHeaders);

      headerUpdate(th, colHeaders);

      headerExit(th.exit().remove(), colHeaders);

      var rows = tbody.selectAll('tr')
        .data(data)
        ;
      rows
        .enter()
        .append('tr')
        ;

      var cells = rows.selectAll('td')
        .data(colHeaders)
          ;
      var cellsEnter = cells
          .enter()
          .append('td')
          ;
      cellEnter(cellsEnter, colHeaders);
      cellUpdate(cells, colHeaders);
      cellExit(rows.exit().remove().selectAll('td'), colHeaders);

      if(style){
        var key;
        for(key in style){
          vis.selectAll(key).attr('style', style[key]);
        }
      }

      if(onUpdate){
        onUpdate(vis);
      }
    });
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.identity = function(_) {
    if (!arguments.length) return identity;
    identity = _;
    return chart;
  };

  chart.cols = function(_) {
    if (!arguments.length) return cols;
    cols = _;
    return chart;
  };

  chart.duration = function(_) {
    if (!arguments.length) return duration;
    duration = _;
    return chart;
  };

  chart.style = function(_) {
    if (!arguments.length) return style;
    style = _;
    return chart;
  };

  chart.updated = function(_){
    if (!arguments.length) return onUpdate;
    onUpdate = _;
    return chart;
  };

  chart.cellEnter = function(_){
    if (!arguments.length) return cellEnter;
    cellEnter = _;
    return chart;
  };

  chart.cellUpdate = function(_){
    if (!arguments.length) return cellUpdate;
    cellUpdate = _;
    return chart;
  };

  chart.cellExit = function(_){
    if (!arguments.length) return cellExit;
    cellExit = _;
    return chart;
  };

  chart.update = function() { container.transition().duration(duration).call(chart); };

  return chart;
};

},{}],"/home/jdarling/rock/examples/web/web/src/lib/charts.js":[function(require,module,exports){
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

},{}],"/home/jdarling/rock/examples/web/web/src/lib/controllers.js":[function(require,module,exports){
var ControllerNotFoundException = function(controllerName){
  var self = this;
  self.name = 'ControllerNotFoundException';
  self.message = 'Controller "'+controllerName+'" not registered';
}
ControllerNotFoundException.prototype = Object.create(Error.prototype);

var Controllers = function(){
  this._controllers = {};
};

Controllers.prototype.create = function(container, controllerName, data){
  var Controller = this._controllers[controllerName];
  if(!Controller){
    throw new ControllerNotFoundException(controllerName);
  }
  return container.controller = new Controller(container, data);
};

Controllers.prototype.get = function(controllerName){
  return this._controllers[controllerName];
};

Controllers.prototype.register = function(controllerName, controller){
  this._controllers[controllerName] = controller;
};

var cleanupControllers = function(node){
  var walkForRemoval = function(node){
    if(node && node.children){
      var i, l = node.children.length, child;
      for(i=0; i<l; i++){
        child = node.children[i];
        walkForRemoval(child);
      }
    }
    if(node.controller){
      if(node.controller.teardown){
        node.controller.teardown(node);
      }
      node.controller = null;
    }
  };
  walkForRemoval(node);
};

if(typeof(MutationObserver)!=='undefined'){
  var observer = new MutationObserver(function(mutations){
    mutations.forEach(function(mutation){
      var removed = mutation.removedNodes?Array.prototype.slice.apply(mutation.removedNodes):[];
      removed.forEach(cleanupControllers);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}else{
  document.body.addEventListener('DOMNodeRemoved', function(e){
    if(e.type=='DOMNodeRemoved'){
      cleanupControllers(e.target);
    }
  }, true);
}

var controllers = new Controllers();
module.exports = controllers;

},{}],"/home/jdarling/rock/examples/web/web/src/lib/handlebarsHelpers.js":[function(require,module,exports){
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
  join: function(arr, joiner){
    return arr.join(joiner);
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
  option: function(value, setValue, options){
    return value == setValue?
      '<option value="'+value+'" SELECTED>'+options.fn(this)+'</options>'
      :'<option value="'+value+'">'+options.fn(this)+'</options>';
  },
};
var key;
for(key in Handlebars.helpers){
  helpers[key] = helpers[key] || Handlebars.helpers[key];
}

module.exports = helpers;

},{}],"/home/jdarling/rock/examples/web/web/src/lib/loader.js":[function(require,module,exports){
/*****************************************************************************\
  options
    uri: {}      - key value paris of data to send in url/get/uri
    data: {}||'' - Object or string to be sent as JSON data in the body
                   for methods that support body data
    dataType: '' - Data type that is being sent, by default application/json
                   is used.  If you use anything but json|jsonp|application/json
                   make sure your data is already encoded properly as a string
  
  Loader.get(uri, options, callback)
  
  Loader.post(uri, options, callback)
  
  Loader.put(uri, options, callback)
  
  Loader.delete(uri, options, callback)
  
\*****************************************************************************/
({define:typeof define!=="undefined"?define:function(deps, factory){
  if(typeof(module)!=='undefined'){
    module.exports = factory();
  }else{
    window.Loader = factory();
  }
}}).
define([], function(){
  var Loader = {};
  var callhashlist = [], callbacks = [];

  Loader.dataTypes={
    'json': 'application/json',
    'jsonp': 'application/json'
  };
  
  var addCallback = function(hash, callback){
    var idx = callhashlist.indexOf(hash), found = idx>-1;
    if(!found){
      idx = callhashlist.length;
      callhashlist[idx] = hash;
      callbacks[idx]=[];
    }
    callbacks[idx].push(callback);
    return found;
  };
  
  var callCallbacks = function(hash, err, results){
    var idx = callhashlist.indexOf(hash), cbs, i, l;
    if(idx>-1){
      cbs = (callbacks.splice(idx, 1)||[])[0]||[];
      callhashlist.splice(idx, 1);
      l = cbs.length;
      for(i=0; i<l; i++){
        cbs[i](err, results);
      }
    };
  };

  var RemoteRequest = function(){
    var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
    if (window.ActiveXObject){
      for (var i=0; i<activexmodes.length; i++){
        try{
          return new ActiveXObject(activexmodes[i])
        }catch(e){
          //suppress error
        }
      }
    }else if (window.XMLHttpRequest){
      return new XMLHttpRequest()
    }
    return false
  };
  
  var encodeParams = function(args){
    var key, s=[], i, l;
    var addParam = function(key, value){
      value = value instanceof Function?value():(value===null?'':value);
      s[s.length]=encodeURIComponent(key)+'='+encodeURIComponent(value);
    };
    if(args instanceof Array){
      l = args.length;
      for(i=0; i<l; i++){
        addParam(args[i].name, args[i].value);
      }
    }else if(args){
      for(key in args){
        addParam(key, args[key]);
      }
    }
    return s.join('&').replace(/%20/g, '+');
  };
  
  var defineMethod = function(HTTPMethod){
    Loader[HTTPMethod] = function(resourceURI, options, callback){
      var getParams='', requestData, callHash, url = resourceURI;
      var requestObject, response, items, body, dataType;
      if(typeof(options)==='function'){
        callback = options;
        options = {};
      }
      callback=callback||function(){};
      options=options||{};
      if(typeof(options.uri)==='string'){
        try{
          options.uri=JSON.parse(options.uri);
        }catch(e){}
      }
      options.uri=options.uri||{};
      callHash = resourceURI+JSON.stringify(options.uri)+JSON.stringify(options.data);
      if(!addCallback(callHash, callback)){
        options.uri.ts = new Date();
        url += ((url||'').indexOf('?')===-1?'?':'&') + encodeParams(options.uri);
        requestObject = new RemoteRequest();
        
        requestObject.onreadystatechange=function(){
          if(requestObject.readyState===4){
            if (requestObject.status===200 || window.location.href.indexOf("http")===-1){
              try{
                response = JSON.parse(requestObject.responseText);
              }catch(e){
                response = requestObject.responseText;
              }
              if(response.error||response.errors){
                callCallbacks(callHash, response);
              }else{
                items=response[response.root];
                try{
                  response = (items instanceof Array)?{
                    items: items,
                    offset: response.offset,
                    limit: response.limit,
                    count: response.count,
                    length: items.length
                  }:items||response;
                }catch(e){
                }
                callCallbacks(callHash, null, response);
              }
            }else{
              var err = new Error(requestObject.statusText+': '+(requestObject.responseText||requestObject.response));
              err.type = requestObject.statusText;
              err.code = requestObject.status;
              err.requestObject = requestObject;
              callCallbacks(callHash, err);
            }
          }
        };
        
        requestObject.open(HTTPMethod.toUpperCase(), url, true);
        if(options.data){
          dataType=Loader.dataTypes[options.dataType]||options.dataType||"application/json";
          if(options.data instanceof FormData){
            body = options.data;
          }else{
            requestObject.setRequestHeader("Content-type", dataType);
            try{
              body = JSON.stringify(options.data);
            }catch(e){
              body = options.body;
            };
          }
          if(options.headers){
            (function(){
              var key;
              for(key in options.headers){
                try{
                  requestObject.setRequestHeader(key, options.headers[key]);
                }catch(e){}
              }
            })();
          }
          requestObject.send(body);
        }else{
          requestObject.send(null);
        }
      }
    };
  };
  
  Loader.postForm = function(form, callback){
		var formData = new FormData(form);
    
    var callHash = form.action + (new Date()).getTime();
    if(!addCallback(callHash, callback)){
      var requestObject = new RemoteRequest();
      requestObject.onreadystatechange=function(){
        if(requestObject.readyState===4){
          if (requestObject.status===200 || window.location.href.indexOf("http")===-1){
            try{
              response = JSON.parse(requestObject.responseText);
            }catch(e){
              response = requestObject.responseText;
            }
            if(response.error||response.errors){
              callCallbacks(callHash, response);
            }else{
              items=response[response.root];
              try{
                response = (items instanceof Array)?{
                  items: items,
                  offset: response.offset,
                  limit: response.limit,
                  count: response.count,
                  length: items.length
                }:items||response;
              }catch(e){
              }
              callCallbacks(callHash, null, response);
            }
          }else{
            var err = new Error(requestObject.statusText+': '+(requestObject.responseText||requestObject.response));
            err.type = requestObject.statusText;
            err.code = requestObject.status;
            err.requestObject = requestObject;
            callCallbacks(callHash, err);
          }
        }
      };
      requestObject.open('POST', form.action, true);
      requestObject.send(formData);
    }
		return false;
  };
  
  (function(methods, callback){
    var i, l=methods.length;
    for(i=0; i<l; i++){
      callback(methods[i]);
    }
  })(['get', 'post', 'put', 'delete'], defineMethod);
  return Loader;
});

},{}],"/home/jdarling/rock/examples/web/web/src/lib/partials.js":[function(require,module,exports){
var Loader = require('../lib/loader.js');
var Support = require('../lib/support.js');
var el = Support.el;
var els = Support.els;

var Partials = function(options){
  var self = this;
  self.options = options;
  self.options.ext = self.options.ext || ".html";
  self.options.path = self.options.path || "/partials/";
};

Partials.prototype.set = function(templateName, source){
  var elem = el('#'+templateName);
  if(!elem){
    elem = document.createElement('script');
    elem.setAttribute('type', 'text/x-template');
    elem.setAttribute('id', templateName);
    document.getElementsByTagName('head').item(0).appendChild(elem);
  }
  elem.innerHTML = source;
  Handlebars.registerPartial(templateName, Handlebars.compile(source));
};

Partials.prototype.get = function(templateName, callback){
  var self = this;
  var elem = el('#'+templateName);
  if(!elem){
    elem = document.createElement('script');
    elem.setAttribute('type', 'text/x-template');
    elem.setAttribute('id', templateName);
    document.getElementsByTagName('head').item(0).appendChild(elem);
  }
  if(!elem.innerHTML){
    Loader.get(self.options.path+templateName+self.options.ext, function(err, template){
      if(err){
        return callback(err);
      }
      elem.innerHTML = template;
      try{
        self.set(templateName, elem.innerHTML);
        callback(null, Handlebars.partials[templateName]);
      }catch(e){
        callback(e, Handlebars.partials[templateName]);
      }
    });
  }else{
    try{
      if(!Handlebars.partials[templateName]){
        self.set(templateName, elem.innerHTML);
      }
      callback(null, Handlebars.partials[templateName]);
    }catch(e){
      callback(e, Handlebars.partials[templateName]);
    }
  }
};

Partials.prototype.preload = function(callback){
  var self = this;
  var toLoad = 1;
  var doneLoading = function(){
    toLoad--;
    if(toLoad<1){
      setTimeout(callback, 1);
    }
  };
  els('[type="text/x-template"]').forEach(function(elem){
    var templateName = elem.getAttribute('id');
    toLoad++;
    self.get(templateName, doneLoading);
  });
  doneLoading();
};

module.exports = Partials;
},{"../lib/loader.js":"/home/jdarling/rock/examples/web/web/src/lib/loader.js","../lib/support.js":"/home/jdarling/rock/examples/web/web/src/lib/support.js"}],"/home/jdarling/rock/examples/web/web/src/lib/sockets.js":[function(require,module,exports){
module.exports = io();

},{}],"/home/jdarling/rock/examples/web/web/src/lib/support.js":[function(require,module,exports){
module.exports = {
  el: function(src, sel){
    if(!sel){
      sel = src;
      src = document;
    }
    return src.querySelector(sel);
  },

  els: function(src, sel){
    if(!sel){
      sel = src;
      src = document;
    }
    return Array.prototype.slice.call(src.querySelectorAll(sel));
  },

  val: function(from){
    return from.value||from.getAttribute('value')||from.innerText||from.innerHTML;
  },

  toHyphens: function(s){
    return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  toCamelCase: function(s){
    return s.toLowerCase().replace(/-(.)/g, function(match, group){
      return group.toUpperCase();
    });
  },

  paramByName: function(name, defaultValue) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? defaultValue : decodeURIComponent(results[1].replace(/\+/g, " "));
  },

  filterParams: function(filter, defaultValues){
    var params = this.params(defaultValues),
        results = {},
        keys = Object.keys(params);
    keys.forEach(function(key){
      if(key.match(filter)){
        results[key] = params[key];
      }
    });
    return results;
  },

  param: function(val, defaultValue){
    var result = defaultValue,
        tmp = [];
    location.search
      .substr(1)
        .split("&")
        .forEach(function(item){
          tmp = item.split("=");
          if (tmp[0] === val){
            result = decodeURIComponent(tmp[1].replace(/\+/g, " "));
          }
        });
    return result;
  },

  reTrue: /^(true|t|yes|y|1)$/i,
  reFalse: /^(false|f|no|n|0)$/i,

  isTrue: function(value){
    return !!this.reTrue.exec(''+value);
  },

  isFalse: function(value){
    return !!this.reFalse.exec(''+value);
  },

  isNumeric: function(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
  },

  decodeValue: function(value){
    if(this.isNumeric(value)){
      return +value;
    }else if(this.isTrue(value)){
      return true;
    }else if(this.isFalse(value)){
      return false;
    }else{
      return value;
    }
  },

  hashParams: function(defaults){
    var q = location.hash.split('?'),
      d = function(s){
            return decodeURIComponent(s.replace(/\+/g, " "));
          },
      r  = /([^&=]+)=?([^&]*)/g,
      r2= /([^&=\[]+)\[(.*)\]/,
      r3= /([^&=\[]+)\]\[(.+)/,
      urlParams = {},
      key, value, e, e2, elem;
    q.shift();
    q = q.join('?');
    for(key in (defaults || {})){
      urlParams[key] = defaults[key];
    }
    while (e = r.exec(q)) {
      if(e[1].indexOf("[") === -1){
        // simple match, no [] identifiers
        urlParams[d(e[1])] = d(e[2]);
      }else{
        value = e[2];
        key = e[1];
        elem = urlParams;
        if(key.indexOf('][')===-1){
          while(e2=r2.exec(key)){
            key = e2[1];
            elem = elem[key] = elem[key] || {};
            key = e2[2];
          }
        }else{
          key = key.replace(/\]$/i, '');
          while(e2 = r3.exec(key)){
            key = e2[1];
            elem = elem[key] = elem[key] || {};
            if(e2[2]){
              key = e2[2];
            }
          }
        }
        if(!key){
          key = elem.length = elem.length||0;
          elem.length++;
        }
        elem[key] = value;
      }
    }
    return urlParams;
  },

  params: function(defaults){
    return this.parseParams(window.location.search.replace(/^\?/,''), true, defaults);
  },

  parseParams: function(paramStr, decodeValues, defaults){
    var self = this,
      q = paramStr||'',
      d = function (s) {
        var value = decodeURIComponent(s.replace(/\+/g, " "));
        if(decodeValues){
          value = self.decodeValue(value);
        }
        return value;
      },
      r  = /([^&=]+)=?([^&]*)/g,
      r2= /([^&=\[]+)\[(.*)\]/,
      r3= /([^&=\[]+)\]\[(.+)/,
      urlParams = {},
      key, value, e, e2, elem;
    if(typeof(decodeValues)==='object'){
      defaults = decodeValues;
      decodeValues = false;
    }
    for(key in (defaults || {})){
      urlParams[key] = defaults[key];
    }
    while (e = r.exec(q)) {
      if(e[1].indexOf("[") === -1){
        // simple match, no [] identifiers
        urlParams[d(e[1])] = d(e[2]);
      }else{
        value = e[2];
        key = e[1];
        elem = urlParams;
        if(key.indexOf('][')===-1){
          while(e2=r2.exec(key)){
            key = e2[1];
            elem = elem[key] = elem[key] || {};
            key = e2[2];
          }
        }else{
          key = key.replace(/\]$/i, '');
          while(e2 = r3.exec(key)){
            key = e2[1];
            elem = elem[key] = elem[key] || {};
            if(e2[2]){
              key = e2[2];
            }
          }
        }
        if(!key){
          key = elem.length = elem.length||0;
          elem.length++;
        }
        elem[key] = value;
      }
    }
    return urlParams;
  },

  pkg: function(from){
    var result = {};
    from.forEach(function(e){
      result[e.getAttribute('name')] = val(e);
    });
    return result;
  }
};

},{}]},{},["./web/src/js/app.js","./web/src/js/controllers/charts/barchartcontroller.js","./web/src/js/controllers/charts/linechartcontroller.js","./web/src/js/controllers/charts/mindmapcontroller.js","./web/src/js/controllers/charts/piechartcontroller.js","./web/src/js/controllers/charts/scatterchartcontroller.js","./web/src/js/controllers/charts/tableviewcontroller.js","./web/src/js/controllers/codemirror.js","./web/src/js/controllers/highlight.js","./web/src/js/controllers/markdown.js","./web/src/js/controllers/pincontroller.js","./web/src/js/controllers/pinfilter.js","./web/src/js/controllers/scripteditor.js"]);
