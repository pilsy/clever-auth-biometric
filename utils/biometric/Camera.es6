var Class      = require('clever-class')
  , cv         = require('opencv')
  , UDPShoutor = require("udpcomm").UDPShoutor
  , crypto     = require('crypto')
  , zlib       = require('zlib');

class Camera extends Class {
  static generateMessageId() {
    return '' + (Date.now() + Math.floor(Math.random()*10000));
  }

  static chunkSize = (1024 * 8) - 24;

  constructor(channel = 1, width = 400, height = 300, maxFps = 16) {
    super();

    this.channel = channel;
    this.width   = width;
    this.height  = height;
    this.maxFps  = maxFps;

    this.udpcomm = new UDPShoutor(9999, 5, function() {});

    this.camera  = new cv.VideoCapture(channel);
    this.camera.setWidth(width);
    this.camera.setHeight(height);
    
    setInterval(this.proxy('read'), 1000 / maxFps);
  }

  read() {
    let rawBuffer  = this.camera.ReadSync();
    rawBuffer.flip(1);
    rawBuffer.toBuffer({ext: ".jpg", jpegQuality: 80});

    let frame      = rawBuffer.toBuffer('base64')
      , messageId  = crypto.randomBytes(8)
      , totalSize  = Math.ceil(frame.length / Camera.chunkSize)
      , byteOffset = 0;

    if (totalSize > 128) {
      console.error('Does not support streaming large data! (over 128 chunks).');
      return;
    }

    for (let i=0; i<totalSize; i++) {
      var chunkBytes = (byteOffset + Camera.chunkSize) < frame.length ? Camera.chunkSize : (frame.length - byteOffset)
        , chunk      = new Buffer(chunkBytes + 12);

      chunk[0] = 0x1e;
      chunk[1] = 0x0f;
      chunk.write(messageId.toString(), 2, 8, 'ascii');
      chunk[10] = i;
      chunk[11] = totalSize;
      frame.copy(chunk, 12, byteOffset, byteOffset+chunkBytes);

      byteOffset += chunkBytes;

      this.udpcomm.sendMessage(chunk);
    }
  }

  onMessage(msg, rinfo) {
    // console.dir(rinfo)
    // console.log(`CameraStreamer: ${process.pid} | from: ${rinfo.address}:${rinfo.port}`);
    // @todo implement msg handlers through the UDP stream for "pause" and "resume"
  }

  pause() {
    this.stream.pause();
  }

  resume() {
    this.stream.resume();
  }
}

module.exports = Camera;
