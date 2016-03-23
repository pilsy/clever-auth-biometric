var OpenCV     = require('opencv')
  , path       = require('path')
  , util       = require('util')
  , async      = require('async')
  , underscore = require('underscore')
  , Face       = require('./Face.es6')
  , Feature    = require('./Feature.es6')
  , haarPath   = path.resolve(path.join(path.dirname(require.resolve("opencv")), '..', 'data'));

// var Class = require('clever-class');

function CascadeClassifier(xmlPath) {
  return new OpenCV.CascadeClassifier(path.join(haarPath, 'haarcascade_' + xmlPath + '.xml'));
}

class Detector {
  cascades   = {
    face     : CascadeClassifier('frontalface_alt2'),
    mouth    : CascadeClassifier('mcs_mouth'),
    nose     : CascadeClassifier('mcs_nose'),
    eyeLeft  : CascadeClassifier('mcs_lefteye'),
    eyeRight : CascadeClassifier('mcs_righteye')
  };
  
  // constructor() {
  //   super();
  // }

  detect(image, callback) {
    // var image = frame.copy();
    // var size = image.size();
    let detections = {};

    // // Make sure the image has a width and height
    // if (size[0] === 0 || size[1] === 0) {
    //   return callback.call(this, undefined, undefined);
    // }

    async.each(
      Object.keys(this.cascades),
      (cascade, next) => {
        try {
          this.cascades[cascade].detectMultiScale(image, (error, objects) => {
            detections[cascade] = !error ? objects : [];
            next();
          });
        } catch(error) {
          next(error);
        }
      },
      (error) => {
        if (!error) {
          callback.call(this, this.getFaces(image, detections), image);
        } else {
          callback(error);
        }
      }
    );
  }

  getFaces(image, detections) {
    let faces = [];

    function outside(input, test) {
      return test.x > input.x + input.width ||
        test.x + test.width < input.x ||
        test.y > input.y + input.height ||
        test.y + test.height < input.y;
    }
    underscore.each(detections.face, function (face) {
      var currentFace = new Face(face);

      underscore.each(detections, function (detect, element) {
        if (element === "face") {
          return;
        }

        underscore.each(detect, function (properties) {
          if (!outside(face, properties)) {
            currentFace.add(element, new Feature(properties, image));
          }
        });
      });

      currentFace.normalize();

      if (currentFace.getFeatureCount() > 0) {
        faces.push(currentFace);
      }
    });

    return faces;
  }
}

module.exports = Detector;
