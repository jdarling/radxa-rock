// Put your source here

var pin = rock.pin(J12_P37);
var toggle = function(duration){
      return function(next){
        pin.set(1, function(){
          setTimeout(function(){
            pin.set(0);
            setTimeout(next, duration||100);
          }, duration||100);
        });
      };
	};

var steps = [
  	toggle(100),
  	toggle(50),
  	toggle(10),
  	toggle(75),
  ];

steps = steps.concat(steps).concat(steps);

var next = function(){
  var f = steps.shift();
  if(f){
  	f(next);
  }
};

pin.mode('output', function(){
  next();
});
