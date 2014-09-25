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

var servo = rock.pin(GPIO199);
servo.numFrames = 100;
servo.FRAME_SIZE= 10000;
servo.nextTick = function(){
  var self = this;
  process.nextTick(function(){
    self.checkTick();
  });
};
servo.checkTick = function(){
  var self = this;
  var timeSpent = getNanoSeconds(self.lastTick);
  if(timeSpent<1500){
    return servo.set(1, function(){
      self.nextTick();
    });
  }
  if(timeSpent<self.FRAME_SIZE){
    return servo.set(0, function(){
      self.nextTick();
    });
  }
  servo.numFrames--;
  if(servo.numFrames>0){
    servo.lastTick = process.hrtime();
    nextTick();
  }
};
servo.mode('output', function(){
  servo.lastTick = process.hrtime();
  servo.checkTick();
});
