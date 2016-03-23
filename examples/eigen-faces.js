var cv          = require('opencv')
  , path        = require('path')
  , moduleRoot  = path.resolve(path.join(__dirname, '..', '..'))
  , async       = require('async')
  , fs          = require('fs')
  , underscore  = require('underscore')
  , Class       = require('clever-class')
  , spawn       = require('child_process').spawn
  , debug       = require('debug')('cleverstack:biometrics')

class FaceRecognizerTrainer extends Class {
  images = [];

  constructor() {
    super();
    this.recognition = cv.FaceRecognizer.createEigenFaceRecognizer(10);
    this.dirList = fs.readdirSync(process.cwd() + '/facedb/');

    let i = 0;
    async.forEach(
      this.dirList,
      (image, done) => {
        if (/jpg/ig.test(image)) {
          cv.readImage(process.cwd() + '/facedb/' + image, (error, cvImage) => {
            cvImage.resize(64, 64);
            this.images.push([++i, cvImage]);
            done(null);
          });
        } else {
          console.log(`Image ${image} skipped...`);
          done(null);
        }
      },
      (err, images) => {
        this.recognition.trainSync(this.images);
        this.recognition.saveSync('./richard.yml')
      }
    );
  }
}

module.exports = new FaceRecognizerTrainer();
