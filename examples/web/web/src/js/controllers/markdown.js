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
