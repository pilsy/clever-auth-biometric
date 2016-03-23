var Feature = require('./Feature.es6');
var underscore = require('underscore');

class Face extends Feature {
  features = [
   'mouth',
   'nose',
   'eyeLeft',
   'eyeRight'
  ];

  colors = {
    face     : [0, 255, 0],
    mouth    : [255, 255, 0],
    nose     : [255, 255, 255],
    eyeLeft  : [255, 0, 0],
    eyeRight : [0, 0, 255]
  };

  constructor(attributes, image) {
    super(attributes, image);

    underscore.each(this.features, (feature) => {
      this[feature] = [];
    });
  }

  drawFace(frame, feature, color) {
    frame.rectangle(
      [feature.getX() * 1, feature.getY() * 1],
      [feature.getWidth() * 1, feature.getHeight() * 1],
      color,
      2
    );
  }

  add(name, feature) {
    if (!(feature instanceof Feature)) {
      throw new TypeError(`Facial Feature doesn't extend the Feature Class!`);
    } else if (!underscore.contains(this.features, name)) {
      throw new TypeError(`Facial Feature with name ${name} is not allowed!`);
    }
    this[name].push(feature);
  }

  remove(name, feature) {
    this[name] = underscore.difference(this[name], [feature]);
  }

  getFeatureCount(feature) {
    if (feature) {
      return this.getFeatures(feature).length;
    }

    return underscore.filter(
      underscore.map(this.features, (feature) => {
        return this[feature].length;
      }),
      (count) => {
        return count > 0;
      }
    ).length;
  }

  getFeature(feature) {
    if (underscore.contains(this.features, feature)) {
      switch (this[feature].length) {
      
      case 0:
        return;
      case 1:
        return this[feature][0];
      default:
        return this[feature];
      }
    }
  }

  getFeatures(feature) {
    var featuresFound = {};

    if (feature && underscore.contains(this.features, feature)) {
      return this[feature];
    }

    underscore.each(this.features, (feature) => {
      featuresFound[feature] = this[feature];
    });

    return featuresFound;
  }

  getMouth() {
    return this.getFeature('mouth');
  }

  getNose() {
    return this.getFeature('nose');
  }

  getEyeLeft() {
    return this.getFeature('eyeLeft');
  }

  getEyeRight() {
    return this.getFeature('eyeRight');
  }

  normalize() {
    this.stripExternalFeatures();

    if (!this.getFeatureCount()) {
      return;
    }

    this.isolateMouth();
    this.isolateNose();
    this.isolateEyes();
  }

  stripExternalFeatures() {
    underscore.each(this.getFeatures(), (features, name) => {
      underscore.each(features, (feature) => {
        if (this.intersect(feature) < 1) {
          this.remove(name, feature);
        }
      });
    });
  }

  isolateMouth() {
    var bestMouth;

    underscore.each(this.getFeatures('mouth'), (mouth) => {
      var toRemove;

      if (!bestMouth) {
        bestMouth = mouth;
        return;
      }

      if (mouth.getY() > bestMouth.getY()) {
        toRemove = bestMouth;
        bestMouth = mouth;
      } else {
        toRemove = mouth;
      }

      if (toRemove) {
        this.remove('mouth', toRemove);
      }
    });
  }

  isolateNose() {
    var mouth = this.getMouth()
      , bestNose;

    // if we have a mouth lets remove all the noses that do not intersect it
    if (mouth) {
      underscore.each(this.getFeatures('nose'), (nose) => {
        if (nose.intersect(mouth) === 0) {
          this.remove('nose', nose);
        }
      });
    }

    if (this.getFeatures('nose').length <= 1) {
      return;
    }

    // we have more than one nose, lets select the most centrally-aligned one
    underscore.each(this.getFeatures('nose'), (nose) => {
      var toRemove;

      if (!bestNose) {
        bestNose = nose;
        return;
      }

      if (this.getNoseCenteredness(nose) < this.getNoseCenteredness(bestNose)) {
        toRemove = bestNose;
        bestNose = nose;
      } else {
        toRemove = nose;
      }

      if (toRemove) {
        this.remove('nose', nose);
      }
    });
  }

  getNoseCenteredness(nose) {
    var mouth = this.getMouth()
      , horizontal
      , vertical;

    if (!mouth) {
      return 0;
    }

    horizontal = (
      (nose.getX() - this.getX())
      +
      (nose.getWidth() / 2)
    ) / this.getWidth();

    vertical = (
      (nose.getY() - this.getY())
      +
      (nose.getHeight() / 2)
    ) / this.getHeight();

    return Math.abs(
      ((horizontal + vertical) / 2) - 0.5
    );
  }

  isolateEyes() {
    var eyes,
      maximumY = this.getY() + Math.abs(this.getHeight() / 2),
      minimumXforRightEye,
      maximumXforLeftEye;

    // first lets discard all the eyes that do no start
    // on the upper half of the face

    underscore.each(this.getFeatures('eyeLeft'), function (eye) {
      if (eye.getY() > maximumY) {
        this.remove('eyeLeft', eye);
      }
    }, this);

    underscore.each(this.getFeatures('eyeRight'), function (eye) {
      if (eye.getY() > maximumY) {
        this.remove('eyeRight', eye);
      }
    }, this);

    // jackpot!
    if (this.getFeatures('eyeLeft').length === 1 &&
        this.getFeatures('eyeRight').length === 1) {
      return;
    }

    eyes = [ 'eyeLeft', 'eyeRight' ];

    // Lets remove all eyes that are within each other
    eyes.forEach((eyeName, index) => {
      this.getFeatures(eyeName).forEach((eye) => {
        let subEyeName = eyes[index ? 0 : 1];

        this.getFeatures(subEyeName).forEach((subEye) => {
          if (eye === subEye) {
            return;
          }

          if (eye.intersect(subEye)) {
            this.remove(subEyeName, subEye);
          }
        })
      })
    })

    // If we have a pair of the same eye and none of the other
    // set one of them as the other eye
    underscore.each(eyes, function (eyeName, idx) {
      var eyeFeatures, otherEyeFeatures,
        otherEyeName = eyes[idx ? 0 : 1];

      eyeFeatures = this.getFeatures(eyeName);
      otherEyeFeatures = this.getFeatures(otherEyeName);

      if (eyeFeatures.length === 2 && otherEyeFeatures.length === 0) {
        eyeFeatures = this.getFeatures(eyeName);


        if (eyeFeatures[0].getX() > eyeFeatures[1].getX()) {
          this.remove(eyeName, eyeFeatures[0]);
          this.add(otherEyeName, eyeFeatures[0]);
        } else {
          this.remove(eyeName, eyeFeatures[1]);
          this.add(otherEyeName, eyeFeatures[1]);
        }
      }
    }, this);

    // jackpot!
    if (this.getFeatures('eyeLeft').length === 1 &&
        this.getFeatures('eyeRight').length === 1) {
      return;
    }

    // Lets remove right-side eyes from the left side
    minimumXforRightEye = this.getX() + Math.abs(this.getWidth() * 0.33);

    underscore.each(this.getFeatures('eyeRight'), function (eye) {
      if (eye.getX() < minimumXforRightEye) {
        this.remove('eyeRight', eye);
      }
    }, this);

    // Lets remove right-side eyes from the left side
    maximumXforLeftEye = this.getX() + Math.abs(this.getWidth() * 0.66);

    underscore.each(this.getFeatures('eyeLeft'), function (eye) {
      if (eye.getX2() > maximumXforLeftEye) {
        this.remove('eyeLeft', eye);
      }
    }, this);
  }
}

module.exports = Face;
