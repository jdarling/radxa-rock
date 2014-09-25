// Put your source here

var pin = rock.pin(J12_P38);
rock.pin(J12_P37).mode('input');
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
  var timeSpent = Math.floor(getNanoSeconds(self.lastTick)/1000);
  if(timeSpent<1500){
    return self.set(1, function(){
      self.nextTick();
    });
  }
  if(timeSpent<self.FRAME_SIZE){
    return self.set(0, function(){
      self.nextTick();
    });
  }
  self.numFrames--;
  if(self.numFrames>0){
    self.lastTick = process.hrtime();
    self.nextTick();
  }
};
servo.mode('output', function(){
  servo.lastTick = process.hrtime();
  servo.checkTick();
});
