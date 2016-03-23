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

var colors = {
  face     : [0, 255, 0],
  mouth    : [255, 255, 0],
  nose     : [255, 255, 255],
  eyeLeft  : [255, 0, 0],
  eyeRight : [0, 0, 255]
};

class StreamingOnDesktopDemo extends Class {
  windows = {};
  frames = [];
  constructor() {
    super();
    this.queue         = async.queue(this.proxy('detectFrame'), 1);
    this.videoStream   = new VideoStream();
    this.videoStream.on('frame', this.proxy(this.queue.push));

    this.detector      = new Detector();

    this.recognizer = cv.FaceRecognizer.createEigenFaceRecognizer(10);
    this.recognizer.loadSync('./richard.yml');

    
    this.faces = {};
    
    setTimeout(() => {
      this.faces = false;
    }, 2000)
  }

  detectFrame(image, done) {
    this.detector.detect(image, (faces) => {
      this.faces = faces;
      for(let i in this.faces) {
        let face = this.faces[i];
        let roi  = image.roi(face.getX(), face.getY(), face.getWidth(), face.getHeight());
        roi = roi.clone();
        roi.resize(64, 64);
        let who  = this.recognizer.predictSync(roi);

        // let eigenValues = this.recognizer.getMat('mean');
        // console.dir(eigenValues);

        // this.videoStream.window.show(eigenValues);
        console.dir(who);
      }

      this.videoStream.window.show(image);
      done(null);
    });
  }

  processFrame(image, done) {
    if (!this.faces) {
      this.detectFrame(image, done);
    } else {
      return;
    }
    console.dir();
    // this.frames.push([this.frames.length, image]);
    // if (this.frames.length === 3) {
    //   console.dir(this.recognizer.trainSync(this.frames));
    //   this.recognizer.saveSync('./richard');
    // }
    this.videoStream.window.show(image);
    done(null);
  }
}

module.exports = new StreamingOnDesktopDemo();

// var recognizer = cv.FaceRecognizer.createLBPHFaceRecognizer();
// recognizer.loadSync(moduleRoot);

//   return new OpenCV.CascadeClassifier(path.join(haarPath, 'haarcascade_' + xmlPath + '.xml'));

// function readFrame() {
//   camera.read((error, frame) => {
//     let grayFrame = frame.clone();
//     grayFrame.convertGrayscale();
//     grayFrame.erode(2);
//     grayFrame.dilate(2);
// var equalized
//     faced.detect(frame, (faces) => {
//       underscore.each(faces, (face) => {
//         let faceSize  = frame.size();
//         let facePic   = frame.roi(face.getX(), face.getY(), face.getWidth(), face.getHeight());

//         equalized = frame.equalizeHist();
//         // let dnaStrain = recognizer.predictSync(facePic);
//         console.dir(path.resolve(path.join(__dirname, '..', '..', 'facedb', Date.now() + '.jpg')));
//         facePic.save(path.resolve(path.join(__dirname, '..', '..', 'facedb', Date.now() + '.jpg')));


//         // facePic.convertGrayscale()
//         frame.adjustROI(
//            -face.y
//          , (face.y + face.height) - faceSize[0]
//          , -face.x
//          , (face.x + face.width) - faceSize[1]
//         );


//         drawFace(frame, face, colors.face);

//         underscore.each(face.getFeatures(), function (features, name) {
//           underscore.each(features, function (feature) {
//             draw(frame, feature, colors[name]);
//           });
//         });
//       });

//       window.show(equalized);

//       process.nextTick(function() {
//         setTimeout(readFrame, camInterval);
//       });
//     });


//     // var grayscaleFrame = im.clone();

//     // faced.detect(im, function(faces, image) {
//     //   var output, colors = {
//     //       "face": [0, 255, 0],
//     //       "mouth": [255, 255, 0],
//     //       "nose": [255, 255, 255],
//     //       "eyeLeft": [255, 0, 0],
//     //       "eyeRight": [0, 0, 255]
//     //   };

//     //   function drawFace(feature, color) {
//     //     im.rectangle(
//     //         [feature.getX() * 1, feature.getY() * 1],
//     //         [feature.getWidth() * 1, feature.getHeight() * 1],
//     //         color,
//     //         2
//     //     );
//     //   }

//     //   function draw(feature, color) {
//     //     // console.dir(feature);
//     //       // im.rectangle(
//     //       //     [feature.getX(), feature.getY()],
//     //       //     [(feature.getWidth() / 100) * 80, (feature.getHeight() / 100) * 80],
//     //       //     color,
//     //       //     2
//     //       // );
//     //     // im.rectangle([feature.getX(), feature.getY()], [feature.getX2(), feature.getY2() ], rectColor, rectThickness);
//     //     // im.ellipse(
//     //     //   feature.getX() + (feature.width / 2),
//     //     //   feature.getY() + (feature.height / 2),
//     //     //   feature.width / 2,
//     //     //   feature.height / 2,
//     //     //   color
//     //     // );
//     //     im.rectangle([feature.getX() + (feature.width / 2), feature.getY() + (feature.height / 2)], [2, 2], color, rectThickness);
//     //   }
      

//     //   var im2;

      

//     //   // var im_canny = im.copy();

//     //   // im_canny.canny(lowThresh, highThresh);
//     //   // im_canny.dilate(nIters);

//     //   // var contours = im_canny.findContours();


//     //   // console.dir(im.goodFeaturesToTrack())
//     //   // var corners = []
//     //   // var corners = im.goodFeaturesToTrack(500, 0.01, 10);
//     //   // for (var i = 0; i < corners.length(); i++) {
//     //   //   im.circle(corners[i],20,GREEN,1);
//     //   // }

//     //   // im.drawAllContours(contours, WHITE);
//     //   underscore.each(faces, function (face) {
//     //     var ims = im.size();
//     //     im2 = im.roi(face.x, face.y, face.width, face.height)
//     //     im.adjustROI(
//     //          -face.y
//     //        , (face.y + face.height) - ims[0]
//     //        , -face.x
//     //        , (face.x + face.width) - ims[1]
//     //     );

//     //     drawFace(face, colors.face);

//     //     // im.roi(face.x, face.y, face.width, face.height)

//     //     // var faceFrame = grayscaleFrame.crop(face.getX() * 1, face.getY() * 0.5, face.width * 1, face.height * 1.3);
//     //     // faceFrame.canny(lowThresh, highThresh);
//     //     // faceFrame.dilate(nIters);


//     //     // var contours = faceFrame.findContours();

//     //     // for (i = 0; i < contours.size(); i++) {

//     //     //   if (contours.area(i) < minArea) continue;

//     //     //   var arcLength = contours.arcLength(i, true);
//     //     //   contours.approxPolyDP(i, 0.01 * arcLength, true);
//     //     //   // contours.boundingRect(i, false);

//     //     //   switch(contours.cornerCount(i)) {
//     //     //     case 3:
//     //     //       im.drawContour(contours, i, GREEN);
//     //     //       break;
//     //     //     case 4:
//     //     //       im.drawContour(contours, i, RED);
//     //     //       break;
//     //     //     default:
//     //     //       im.drawContour(contours, i, GREEN);
//     //     //   }
//     //     // }
//     //     // 
//     //     // var faceFrame = grayscaleFrame.crop(face.getX() * 1, face.getY() * 1, face.width * 1, face.height * 1);
//     //     // var actualFrame = im.crop(face.getX() * 1, face.getY() * 1, face.width * 1, face.height * 1);
//     //     // faceFrame.canny(lowThresh, highThresh);
        


//     //     // var contours = faceFrame.findContours();

//     //     // for (var i = 0; i < contours.size(); i++) {
//     //     //   if (contours.area(i) < minArea || contours.area(i) > maxArea) continue;

//     //     //   var arcLength = contours.arcLength(i, true);
//     //     //   // contours.approxPolyDP(i, 0.01 * arcLength, true);
//     //     //   contours.boundingRect(i, false);

//     //     //   switch(contours.cornerCount(i)) {
//     //     //     case 3:
//     //     //       actualFrame.drawContour(contours, i, GREEN);
//     //     //       break;
//     //     //     case 4:
//     //     //       actualFrame.drawContour(contours, i, RED);
//     //     //       break;
//     //     //     default:
//     //     //       actualFrame.drawContour(contours, i, GREEN);
//     //     //   }
//     //     // }


//     //     underscore.each(face.getFeatures(), function (features, name) {
//     //       underscore.each(features, function (feature) {
//     //         // if (name !== 'nose') {
//     //           // var faceFrame = grayscaleFrame.crop(feature.getX() * 1, feature.getY() * 1, feature.width * 0.5, feature.height * 0.5);
//     //           // var actualFrame = im.crop(feature.getX() * 1, feature.getY() * 1, feature.width * 0.5, feature.height * 0.5);
//     //           // faceFrame.canny(lowThresh, highThresh);
              


//     //           // var contours = faceFrame.findContours();

//     //           // for (i = 0; i < contours.size(); i++) {
//     //           //   if (contours.area(i) < minArea || contours.area(i) > maxArea) continue;

//     //           //   var arcLength = contours.arcLength(i, true);
//     //           //   contours.approxPolyDP(i, 0.01 * arcLength, true);
//     //           //   // contours.boundingRect(i, false);

//     //           //   switch(contours.cornerCount(i)) {
//     //           //     case 3:
//     //           //       actualFrame.drawContour(contours, i, GREEN);
//     //           //       break;
//     //           //     case 4:
//     //           //       actualFrame.drawContour(contours, i, RED);
//     //           //       break;
//     //           //     default:
//     //           //       actualFrame.drawContour(contours, i, GREEN);
//     //           //   }
//     //           // }
              
//     //         // }
//     //         draw(feature, colors[name]);
//     //       });
//     //     });
//     //   });
      
//     //   // for (i = 0; i < contours.size(); i++) {

//     //   //   if (contours.area(i) < minArea) continue;

//     //   //   var arcLength = contours.arcLength(i, true);
//     //   //   // contours.approxPolyDP(i, 0.01 * arcLength, true);
//     //   //   // contours.boundingRect(i, false);

//     //   //   switch(contours.cornerCount(i)) {
//     //   //     case 3:
//     //   //       im.drawContour(contours, i, GREEN);
//     //   //       break;
//     //   //     case 4:
//     //   //       im.drawContour(contours, i, RED);
//     //   //       break;
//     //   //     default:
//     //   //       im.drawContour(contours, i, GREEN);
//     //   //   }
//     //   // }
      
//     //   // for (i = 0; i < contours.size(); i++) {

//     //   //   var area = contours.area(i);
//     //   //   if (area < minArea || area > maxArea) continue;

//     //   //   var arcLength = contours.arcLength(i, true);
//     //   //   contours.approxPolyDP(i, 0.01 * arcLength, true);

//     //   //   if (contours.cornerCount(i) != 4) continue;

//     //   //   var points = [
//     //   //     contours.point(i, 0),
//     //   //     contours.point(i, 1),
//     //   //     contours.point(i, 2),
//     //   //     contours.point(i, 3)
//     //   //   ]

//     //   //   im.line([points[0].x,points[0].y], [points[2].x, points[2].y], RED);
//     //   //   im.line([points[1].x,points[1].y], [points[3].x, points[3].y], RED);
//     //   // }

//     //   // for(i = 0; i < contours.size(); i++) {
//     //   //   if(contours.area(i) > maxArea) {
//     //   //     var moments = contours.moments(i);
//     //   //     var cgx = Math.round(moments.m10 / moments.m00);
//     //   //     var cgy = Math.round(moments.m01 / moments.m00);
//     //   //     // if (face.intersect(contours)) {}
//     //   //     // im.drawContour(contours, i, GREEN);
//     //   //     // im.line([cgx - 5, cgy], [cgx + 5, cgy], RED);
//     //   //     // im.line([cgx, cgy - 5], [cgx, cgy + 5], RED);
//     //   //   }
//     //   // }

//     //   // im.drawAllContours(contours, [255, 255, 255]);

//     //   window.show(im);
//     //   // process.nextTick(readFrame);

//     //   // socket.emit('frame', { buffer: image.toBuffer() });
//     //   setTimeout(readFrame, camInterval);
//     // });

//   });
// }
// setTimeout(readFrame, camInterval);

// setInterval(readFrame, camInterval);
  // var detector = new Detector();

  // detector.analyze(frame, function(err, faces) {
  //   console.dir(faces);
  //   // window.show(frame);
  // });
  


// async.whilst(
//   function() {
//     return running;
//   },
//   function readFrame(callback) {
//     camera.read(function(err, frame) {
//       if (frame.width() > 0 && frame.height() > 0) {
//         var detector = new Detector();
//         detector.analyze(frame, function(faces) {
//           // console.dir(faces);
//           window.show(frame);
//         });
//       }
//       callback(null);
//     });
//   }
// );
  
  // var detector = new Detector();

  // detector.analyze((faces) => {
  //   console.dir(arguments);
  // });

  // cv.showImage('Webcam', frame);
  // if (window.blockingWaitKey(10)) {
  //   break;
  // }
// }

// cv.cvReleaseCapture(camera.ref());
// cv.cvDestroyWindow('Webcam');

  // camera.read(function(err, frame) {
  //   if (err) throw err;

  //   console.log(frame.size())
  //   if (im.size()[0] > 0 && im.size()[1] > 0){
  //     window.show(im);
  //   }
  //   window.blockingWaitKey(0, 50);
  // });

// while(running) {
//   var frame = cv.queryFrame(capture);
//   var frame = camera.read(function())

//   // console.dir(frame);
//   // var grayscaleFrame = frame.clone();
//   // grayscaleFrame.convertGrayscale();
//   // grayscaleFrame.erode(2);
//   // grayscaleFrame.dilate(2);


  // cv.showImage( 'Webcam', frame );
  // var key = cv.waitKey( 10 );
  // if ( 27 === key ) {
  //   break;
  // }
// }


