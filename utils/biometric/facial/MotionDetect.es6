var Class = require('clever-class')
  , cv    = require('opencv');

class MotionDetect extends Class {
  frames = [];
  motion = [];
  mat    = false;

  constructor(window = false) {
    super();
    this.window = window;
  }

  detect(gray) {
    let motion;

    if (this.frames.length >= 3) {
      let diff = new cv.Matrix(gray.width(), gray.height());

      let d1 = new cv.Matrix(gray.width(), gray.height());
      let d2 = new cv.Matrix(gray.width(), gray.height());

      let prev = this.frames[ this.frames.length - 2 ];
      let last = this.frames[ this.frames.length - 1 ];

      d1.absDiff(prev, gray);
      d2.absDiff(last, gray);

      diff.bitwiseAnd(d1, d2);
      diff.threshold(0, 255);
      diff.dilate(1);

      this.motion.push(diff);

      if (this.motion.length >= 6) {
        motion = new cv.Matrix(gray.width(), gray.height());
        motion.convertGrayscale();

        motion.addWeighted(this.motion[0], 0.7, this.motion[1], 0.7, this.motion[2], 0.8, this.motion[3], 0.8, this.motion[4], 0.9, this.motion[5], 0.9);
        this.motion.shift();
        this.mat = motion;
        if (this.window) {
          this.window.show(this.mat);
        }
      }

      this.frames.shift();
    }
    this.frames.push(gray);
  }
}

module.exports = MotionDetect;
