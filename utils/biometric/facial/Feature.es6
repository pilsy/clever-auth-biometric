// var Class = require('clever-class');
var underscore = require('underscore');
var cv = require('opencv');


class Feature {
  minArea = 10;
  maxArea = 200;
  windows = {
    roi: new cv.NamedWindow('ROI', 1),
    skin: new cv.NamedWindow('SKIN', 1),
    canny: new cv.NamedWindow('CANNY', 1)
  }

  constructor(attributes, frame = null) {
    if (attributes) {
      this.x      = attributes.x;
      this.y      = attributes.y;
      this.width  = attributes.width;
      this.height = attributes.height;


      if (frame !== null) {
        // this.x + 20;
        // this.y + 20;
        // this.width - 40;
        // this.width - 40;

        // Get the ROI
        this.roi  = frame.roi(this.x, this.y, this.width, this.height);

        
        // this.windows.roi.show(this.roi);
        // // Detect any skin
        // this.skin = this.roi.clone();
        // this.skin.convertHSVscale();
        // this.skin.inRange([0, 10, 60], [33, 150, 255]);
        // this.skin.dilate(4);
        // this.skin.gaussianBlur([3, 3], [3, 3]);
        // this.skin.dilate(6);
        // this.skin.erode(2);
        // this.skin.medianBlur(5);

        // this.skin.bitwiseAnd(this.roi, this.roi, this.skin);
        // this.windows.skin.show(this.skin);

        // // Get a Canny Frame
        // this.canny = this.roi.clone();
        // this.canny.canny(140, 190);
        // this.windows.canny.show(this.canny);


        // // Find the contours!
        // this.contours = this.canny.findContours();
        // this.roi.drawAllContours(this.contours);

        // for (var i = 0; i < this.contours.size(); i++) {
        //   if (this.contours.area(i) < this.minArea || this.contours.area(i) > this.maxArea) continue;

        //   var arcLength = this.contours.arcLength(i, true);
        //   // this.contours.approxPolyDP(i, 0.02 * arcLength, true);
          
        //   this.contours.boundingRect(i, true);
        //   this.roi.drawContour(this.contours, i, [0, 255, 0]);

        //   // var moments   = this.contours.moments(i);
        //   // var cgx = Math.round(moments.m10 / moments.m00);
        //   // var cgy = Math.round(moments.m01 / moments.m00);
        //   // this.roi.drawContour(this.contours, i, [0, 255, 0]);
        //   // this.roi.line([cgx - 5, cgy], [cgx + 5, cgy], [0, 255, 0]);
        //   // this.roi.line([cgx, cgy - 5], [cgx, cgy + 5], [0, 255, 0]);
        // }
      }
    }
  }

  draw(frame, feature, color) {
    frame.rectangle([feature.getX() + (feature.width / 2), feature.getY() + (feature.height / 2)], [2, 2], color, rectThickness);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }
  getX2() {
    return this.getX() + this.getWidth();
  }

  getY2() {
    return this.getY() + this.getHeight();
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getCenter() {
    return { x: Math.ceil(this.x + (this.width / 2)), y: Math.ceil(this.y + (this.height / 2)) };
  }

  intersect(feature) {
    var excessHeightTop
      , excessHeightBottom
      , excessWidthLeft
      , excessWidthRight
      , excessHeight
      , excessWidth
      , excess;

    if (( this.getX2() < feature.getX() ||
          this.getX() > feature.getX2() ||
          this.getY2() < feature.getY() ||
          this.getY() > feature.getY2()
      )) {
      return 0;
    }

    excessHeightTop    = (this.getY() - feature.getY());
    excessHeightBottom = (feature.getY2() - this.getY2());
    excessWidthLeft    = (this.getX() - feature.getX());
    excessWidthRight   = (feature.getX2() - this.getX2());

    excessHeight       = ( ( excessHeightTop > 0 ? excessHeightTop : 0) + (excessHeightBottom > 0 ? excessHeightBottom : 0 ) );
    excessWidth        = ( ( excessWidthLeft > 0 ? excessWidthLeft : 0 ) + ( excessWidthRight > 0 ? excessWidthRight : 0 ) );
    excess             = ( excessHeight * feature.getWidth() + excessWidth * feature.getHeight() );

    return 1 - (excess / (feature.getWidth() * feature.getHeight()));
  };
}

module.exports = Feature;
