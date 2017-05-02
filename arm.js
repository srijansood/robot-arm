/*
Robotic Arm with 4 servos controlled by Leap Motion
Original Boilerplate: https://github.com/DecodedCo/leap-arduino/blob/master/servo.js
*/

// get leap data
var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    // mm range of leap motion to use, see leap-range.js to find
    leap_range = [-100,100], // x of right hand
    frame, palm;

// parse the data and respond
board.on('ready', function() {
    // base rotation
    base = new five.Servo({
      pin: 9,
      range: [0, 179] // dependent on servo
    });

    //right servo - forward backward extension
    right = new five.Servo({
      pin: 10,
      range: [0, 179] // dependent on servo
    });

    //left servo - up and down
    left = new five.Servo({
      pin: 11,
      range: [60, 800] // dependent on servo
    });

    //gripper servo
    gripper = new five.Servo({
      pin: 6,
      range: [0, 150] // dependent on servo
    });


    base.to(90);   // set base to midpoint
    gripper.to(0); // set gripper to 0

    ws.on('message', function(data, flags) {
        frame = JSON.parse(data);
        // if only one hand is present
        if (frame.hands && frame.hands.length == 1) {
            // extract centre palm position in mm [x,y,z]
            palm = frame.hands[0].palmPosition;
            grabStrength = frame.hands[0].s;
            grabStrength = grabStrength < 0.5 ? 0 : grabStrength;
            // grip = (10*(grabStrength - 1.0)).map()
            // if (grabStrength < 1.00) {
            //   grip_pos = 0;
            // } else if ( grabStrength < 2.50) {
            //   grip_pos = 90;
            // } else {
            //   grip_pos = 180;
            // }

            // console.log("grip", grip_pos);
            console.log("radius", frame.hands[0].sphereRadius);
            console.log("grab", grabStrength);
            console.log("Palm: ", palm);

            base.to(palm[0].map());
            right.to(palm[2].map());
            left.to(179 - palm[1].map() * 3);
            gripper.to(grabStrength * 100);
        }
    });
});

// map two  ranges, adapted from SO: 10756313
Number.prototype.map = function () {
  var output = Math.round((this - leap_range[0]) * (base.range[1] - base.range[0]) / (leap_range[1] - leap_range[0]) + base.range[0]);

  // check output is within range, or cap
  output = (output > base.range[1]) ? base.range[1] : output;
  output = (output < base.range[0]) ? base.range[0] : output;
  // is the servo range reversed? uncomment below
  output = base.range[1] - output;
  return output;
}
