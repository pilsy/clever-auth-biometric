var Class = require('clever-class');

class CannyFilter extends Class {
  construct(lowThresh = 20, highThresh = 100, nIters = 1, minArea = 100, maxArea = 4000) {
    super();

    this.lowThresh  = lowThresh;
    this.highThresh = highThresh;
    this.nIters     = nIters;
    this.minArea    = minArea;
    this.maxArea    = maxArea;
  }
}
