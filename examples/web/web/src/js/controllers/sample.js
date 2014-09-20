var controllers = require('../../lib/controllers.js');

var SampleController = function(container, data){
  container.innerHTML = container.dataset.content;
};

controllers.register('SampleController', SampleController);
