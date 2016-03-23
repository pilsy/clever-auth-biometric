var cv          = require('opencv')
  , path        = require('path')
  , moduleRoot  = path.resolve(path.join(__dirname, '..', '..'))
  , running     = true
  , async       = require('async')
  , fs          = require('fs')
  , underscore  = require('underscore')
  , Class       = require('clever-class')
  , spawn       = require('child_process').spawn
  , Detector    = require(path.join(moduleRoot, 'utils', 'biometric', 'facial', 'Detector.es6'))
  , VideoStream = require(path.join(moduleRoot, 'utils', 'biometric', 'VideoStream.es6'))
  , Feature     = require(path.join(moduleRoot, 'utils', 'biometric', 'facial', 'Feature.es6'))
  , MotionDetect= require(path.join(moduleRoot, 'utils', 'biometric', 'facial', 'MotionDetect.es6'))
  , SkinDetect  = require(path.join(moduleRoot, 'utils', 'biometric', 'facial', 'SkinDetect.es6'))
  , debug       = require('debug')('cleverstack:biometrics')

class TakeFacePics extends Class {
  constructor() {
    super();

    this.queue         = async.queue(this.proxy('detectFrame'), 1);

    this.detector      = new Detector();
    this.videoStream   = new VideoStream();
    this.videoStream.on('frame', this.proxy(this.queue.push));
  }

  queueEmpty() {
    console.log('Queue Empty! ' + this.queue.length());
  }

  queueSaturated() {
    console.log('Queue Saturated! ' + this.queue.length());
  }

  detectFrame(image, done) {
    let gray = image.clone();
    gray.convertGrayscale();

    this.detector.detect(image, (faces) => {
      this.faces = faces;
      for(let i in this.faces) {
        let face = this.faces[i];
        let roi  = gray.roi(face.getX(), face.getY(), face.getWidth(), face.getHeight());
        roi.clone();
        roi.resize(64, 64);
        roi.save(`./facedb/${Date.now()}_64_64.jpg`);
      }

      this.videoStream.window.show(image);
      done(null);
    });
  }
}

module.exports = new TakeFacePics();
