var Class = require('clever-class')
  , cv    = require('opencv');

class MotionDetect extends Class {
  mat = false;

  constructor(window = false) {
    super();
    this.window = window;
  }

  detect(image) {
    let mask = image.clone();
    mask.convertHSVscale();
    // mask.inRange([3, 48, 48], [33, 150, 255]);
    mask.inRange([0, 48, 80], [20, 255, 255]);
    // mask.dilate(2);
    // mask.erode(1);

    let colorMask = new cv.Matrix(image.width(), image.height());
    colorMask.bitwiseAnd(image, image, mask);
    // let skinBinaryFilter = mat.clone();
    // skinBinaryFilter.erode(1);
    // skinBinaryFilter.gaussianBlur([5, 5], 0);
    // skinBinaryFilter.erode(2);
    // skinBinaryFilter.dilate(4);

    // let skin = new cv.Matrix(image.width(), image.height());

    // skin.bitwiseAnd(image, image, skinBinaryFilter);

    this.mat = colorMask;

    this.window.show(colorMask);
  }
}

module.exports = MotionDetect;
