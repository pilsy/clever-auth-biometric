var cv          = require('opencv')
  , path        = require('path')
  , moduleRoot  = path.resolve(path.join(__dirname, '..', '..'))
  , running     = true
  , async       = require('async')
  , underscore  = require('underscore')
  , Class       = require('clever-class')
  , spawn       = require('child_process').spawn
  , Detector    = require(path.join(moduleRoot, 'utils', 'biometric', 'facial', 'Detector.es6'))
  , VideoStream = require(path.join(moduleRoot, 'utils', 'biometric', 'VideoStream.es6'))
  , Feature     = require(path.join(moduleRoot, 'utils', 'biometric', 'facial', 'Feature.es6'))
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
  lastImage = null;
  depth = [];

  constructor() {
    super();
    this.skinTimer   = Date.now();
    this.detector    = new Detector();
    this.videoStream = new VideoStream();
    this.videoStream.on('frame', this.proxy('processFrame'));

    // this.windows.hist    = new cv.NamedWindow('Histogram', 1);
    this.windows.grayscale    = new cv.NamedWindow('Grayscale', 1);
    this.windows.hsvscale     = new cv.NamedWindow('HSVscale', 1);
    this.windows.canny     = new cv.NamedWindow('Canny', 1);
    this.windows.skin     = new cv.NamedWindow('Skin Mask', 1);
    this.windows.skinMat = new cv.NamedWindow('Skin Mat', 1);
    this.windows.gaussianBlur = new cv.NamedWindow('Gaussian Blur', 1);
    this.windows.roi          = new cv.NamedWindow('ROI', 1);
    // this.stereoBM = new cv.StereoBM();//61, 16 * 16, 5
    

  }

  processFrame(image) {
    let hsvFrame = image.clone();
    hsvFrame.convertHSVscale();
    this.windows.hsvscale.show(hsvFrame);

    let gray = image.clone();
    gray.convertGrayscale();
    this.windows.grayscale.show(gray);
    
    // let skin = image.copy();

    // skin.convertHSVscale();
    // skin.inRange([0, 48, 80], [20, 255, 255]);
    // skin.erode(2);
    // skin.dilate(2);
    // skin.gaussianBlur([3, 3], 0);
    // skin.bitwiseAnd(image, image, skin);

    // this.windows.hsvscale.show(hsv);
    
    // let gaussianBlur = image.copy();
    // gaussianBlur.gaussianBlur();
    // this.windows.gaussianBlur.show(gaussianBlur);

    if (!this.faces) {
      this.detector.detect(image, (faces) => {
        this.faces = faces;

        for(let i in this.faces) {
          let face = this.faces[i];
          // let faceFrame = image.crop();
          // let roi  = image.roi(face.getX(), face.getY(), face.getWidth(), face.getHeight());

          // console.dir(roi)

          // let trackableFeatures = roi.goodFeaturesToTrack(25, 0.01, 10);
          // for (let i = 0; i < trackableFeatures.length; i++) {
          //   console.dir(trackableFeatures[i]);
          //   image.rectangle([trackableFeatures[i].x, trackableFeatures[i].y], [2, 2], colors.face, 2);
          // }
          // face.drawFace(image, face, colors.face);
          // this.windows.roi.show(roi);
          
          // let newWidth = Math.ceil(face.width / 2);
          // let newHeight = Math.ceil(face.height / 2);
          // let x = Math.ceil(face.getX());
          // let y = Math.ceil(face.getY());
          // let rect = [face.getX(), face.getY(), face.getWidth(), face.getHeight()];
          // console.dir(rect);
          
          // let x = face.getX()// + (face.getWidth() / 2) - 3;
          // let y = face.getY()// + (face.getHeight() / 2) - 3;
          // let rect = [x, y, x + face.getWidth(), y + face.getHeight()];
          // image.rectangle([rect[0], rect[1]], [rect[2] - rect[0], rect[3] - rect[1]], colors.face);
          // console.dir(rect);

          // face.motion = new cv.TrackedObject(image, rect);
          // let tracking = face.motion.track(image);
          // image.rectangle([tracking[0], tracking[1]], [tracking[2] - tracking[0], tracking[3] - tracking[1]], colors.face);
          // image.save('facedb/image.jpg');
          // image.rectangle([rect[0], rect[1]], [rect[2], rect[3]], colors.face);

          underscore.each(face.getFeatures(), (features, name) => {
            underscore.each(features, (feature) => {
              // feature.motion = new cv.TrackedObject(image, [feature.getX(), feature.getY(), feature.getX2(), feature.getY2()]);
              // let tracking = feature.motion.track(image);
              // image.rectangle([tracking[0], tracking[1]], [tracking[2] - tracking[0], tracking[3] - tracking[1]], colors[name], 2);
              // image.save('facedb/image.jpg');
              // feature.motion = new cv.TrackedObject(image, [270, 120, 280, 130], {channel: 'value'});
              // image.rectangle([270, 120, 280, 130], colors[name], 2);
              // image.rectangle([, feature.getY() + (feature.height / 2)], [2, 2], colors[name], 2);
              // image.rectangle([feature.getX() + (feature.width / 2), feature.getY() + (feature.height / 2)], [2, 2], colors[name], 2);
            });
          });

        }

        this.videoStream.window.show(image);
        this.lastImage = image;
        // this.windows.grayscale.show(gray);
      });
    } else {
      if (Date.now() > (this.skinTimer + (1000 / 5)))  {
        this.skinTimer = Date.now();
        for (var i in this.faces) {
          let face    = this.faces[i];
          let faceRoi = image.roi(face.getX(), face.getY(), face.getWidth(), face.getHeight());
        
          // ----- SKIN DETECTION --- //
          let minArea = 10;
          let maxArea = 2000;
          let skin = hsvFrame.clone();

          // ----- OUTSIDE DAY --- //
          // skin.gaussianBlur([3, 3], [3, 3]);
          skin.inRange([0, 48, 48], [33, 150, 255]);
          this.windows.skinMat.show(skin.clone());
          // skin.gaussianBlur([3, 3], [3, 3]);
          // skin.medianBlur(3);
          // skin.gaussianBlur([3, 3], [4, 4]);
          // this.windows.gaussianBlur.show(skin.clone());
          skin.erode(4);
          skin.dilate(9);
          // skin.erode(4);
          this.windows.roi.show(skin.clone());

          // skin.dilate(2);
          // skin.erode(4);

          // ----- OUTSIDE DAY --- //


          skin.bitwiseAnd(image, image, skin);
          this.windows.skin.show(skin);

          // let histogram = skin.clone();
          // histogram.shift(100,200);
          // histogram.convertGrayscale();

          // let hist = histogram.equalizeHist();

          let canny = skin.clone();
          canny.canny(140, 290);
          // canny.dilate(2);
          this.windows.canny.show(canny);

          // let cannyRoi = canny.roi(face.getX(), face.getY(), face.getWidth(), face.getHeight());

          this.contours = canny.findContours();

          // for (var i = 0; i < this.contours.size(); i++) {
          //   if (this.contours.area(i) < minArea || this.contours.area(i) > maxArea) continue;

          //   var arcLength = this.contours.arcLength(i, true);
          //   var moments   = this.contours.moments(i);
          //   var cgx = Math.round(moments.m10 / moments.m00);
          //   var cgy = Math.round(moments.m01 / moments.m00);
          //   // faceRoi.drawContour(contours, i, colors.face);
          //   // faceRoi.line([cgx - 5, cgy], [cgx + 5, cgy], colors.face);
          //   // faceRoi.line([cgx, cgy - 5], [cgx, cgy + 5], colors.face);

          //   // this.contours.approxPolyDP(i, 0.02 * arcLength, true);
          //   this.contours.boundingRect(i, true);
          //   // image.drawContour(contours, i, colors.face);
          // }

          // let faceRoiSkin = skin.roi(face.getX(), face.getY(), face.getWidth(), face.getHeight());
          // faceRoiSkin.canny(90, 190);
          // let faceRoiContours = faceRoiSkin.findContours();
          // for (var i = 0; i < faceRoiContours.size(); i++) {
          //   if (faceRoiContours.area(i) < minArea || faceRoiContours.area(i) > maxArea) continue;

          //   var arcLength = faceRoiContours.arcLength(i, true);
          //   faceRoiContours.approxPolyDP(i, 0.01 * arcLength, true);
          //   faceRoiContours.boundingRect(i, false);
          //   faceRoi.drawContour(faceRoiContours, i, colors.face);
          // }
          // faceRoi.drawAllContours(faceRoiSkin.findContours(), colors.face);
          // ----- SKIN DETECTION --- //
          
          underscore.each(face.getFeatures(), (features, name) => {
            underscore.each(features, (feature) => {

            // let tracking = feature.motion.track(image);
            // image.rectangle([tracking[0], tracking[1]], [tracking[2] - tracking[0], tracking[3] - tracking[1]], colors[name], 2);
            // console.dir(tracking);


              // if (name === 'eyeLeft') {
                // let x = feature.getX() + (feature.getWidth() / 2) - 10;
                // let y = feature.getY() + (feature.getHeight() / 2) - 10;

                // let realEye = image.roi(x, y, 20, 20);
                // let eye = realEye.clone();
                // eye.pyrUp();
                // eye.convertGrayscale();
                // eye.gaussianBlur([3, 3], 0);
                // // eye.convertHSVscale();
                // eye.canny(90, 190);
                // eye.dilate(1);
                // let eyeContours = eye.findContours();

                // // eye.erode(2);
                // realEye.drawAllContours(eyeContours);

                // // eye.resize(1000, 1000);
                // this.windows.hsvscale.show(hsvFrame);


              //   image.ellipse(
              //     feature.getX() + (feature.width / 2),
              //     feature.getY() + (feature.height / 2),
              //     feature.width / 2,
              //     feature.height / 2,
              //     colors[name]
              //   );
              // }
                // x-w/2,y-h/2,w,h

                // margin-left | margin-top | ? | ?

              // feature.tracker = new new cv.TrackedObject(image, [(feature.getX() + (feature.width / 2)), (feature.getY() + (feature.height / 2)), 2, 2], {channel: 'value'});
              // image.rectangle([feature.getX() + (feature.width / 2), feature.getY() + (feature.height / 2)], [2, 2], colors[name], 2);
            });
          });
          
        }
      }

      if (this.contours) {
        for (var i = 0; i < this.contours.size(); i++) {
          // if (this.contours.area(i) < minArea || this.contours.area(i) > maxArea) continue;

          // var arcLength = this.contours.arcLength(i, true);
          // var moments   = this.contours.moments(i);
          // var cgx = Math.round(moments.m10 / moments.m00);
          // var cgy = Math.round(moments.m01 / moments.m00);
          // faceRoi.drawContour(contours, i, colors.face);
          // faceRoi.line([cgx - 5, cgy], [cgx + 5, cgy], colors.face);
          // faceRoi.line([cgx, cgy - 5], [cgx, cgy + 5], colors.face);

          // this.contours.approxPolyDP(i, 0.02 * arcLength, true);
          this.contours.boundingRect(i, true);
          image.drawContour(this.contours, i, colors.face);
        }

      }

      this.videoStream.window.show(image);
      this.lastImage = image;
      // this.windows.grayscale.show(gray);
    }
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


