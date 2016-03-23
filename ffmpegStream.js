var cp = require('child_process')
  , exec = cp.exec;

child = exec("ffmpeg -f libavdevice -framerate 25 -video_size 640x480 -i /dev/video0 -f rtsp -rtsp_transport tcp rtsp://localhost:7002/live.sdp",function(error,stdout,stderr){
  console.log('STDOUT: ',stdout);
  console.log('STDERR: ',stderr);
});
