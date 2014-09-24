// Put your source here

var toggle = function(duration){
      return function(next){
        rock.set(J12_P37, 1, function(){
          setTimeout(function(){
            rock.set(J12_P37, 0);
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

rock.setPinMode(J12_P37, 'output', function(){
  next();
});
