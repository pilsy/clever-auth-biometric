var UDPHub  = require('udpcomm').UDPHub
  , server  = new UDPHub(9999)
  , spawn   = require('child_process').spawn
  , debug   = require('debug')('cleverstack:biometrics')
  , running = true
  , videoProcessor
  , videoDisplayer

server.start();

function spawnVideoDisplayer() {
  videoDisplayer = spawn('node', ['bin/videoDisplayer'], { cwd: process.cwd(), env: process.env, stdio: 'inherit' });
  // videoDisplayer.on('exit', function(worker, code, signal) {
  //   if (running !== true) {
  //     return;
  //   }

  //   debug('videoDisplayer Worker %s has died with code %s and signal %s - Forking new process in 2.5 seconds...', worker.pid, code, signal);
  //   setTimeout(spawnVideoStreamer, 2500);
  // });
  function killVideoDisplayer() {
    running = false;
    process.kill(videoDisplayer);
  }
  process.on('SIGTERM', killVideoDisplayer);
}

function spawnVideoStreamer() {
  videoProcessor = spawn('node', ['bin/cameraStream'], { cwd: process.cwd(), env: process.env, stdio: 'inherit' });
  // videoProcessor.on('exit', function(worker, code, signal) {
  //   if (running !== true) {
  //     return;
  //   }

  //   debug('VideoStream Worker %s has died with code %s and signal %s - Forking new process in 2.5 seconds...', worker.pid, code, signal);
  //   setTimeout(spawnVideoStreamer, 2500);
  // });
  function killVideoProcessor() {
    running = false;
    process.kill(videoProcessor);
  }
  process.on('SIGTERM', killVideoProcessor);
}

setTimeout(function() {
  spawnVideoStreamer();
  
  setTimeout(function() {
    spawnVideoDisplayer();
  }, 2500);
}, 2500);
