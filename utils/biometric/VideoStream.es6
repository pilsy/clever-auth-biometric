var Class      = require('clever-class')
  , cv         = require('opencv')
  , UDPShoutor = require("udpcomm").UDPShoutor
  , crypto     = require('crypto')
  , zlib       = require('zlib');

class VideoStream extends Class {
  fps         = 0;
  fpsRef      = Date.now();
  frameChunks = {};
  
  constructor(port = 9999, channelId = 5, autoSize = true) {
    super();
    this.window   = new cv.NamedWindow(`VideoStream:${channelId}`, !!autoSize ? 1 : 0);
    this.udpcomm  = new UDPShoutor(port, channelId, this.proxy('onMessage'));
    setInterval(this.proxy('ping'), 1000);
  }

  ping() {
    this.udpcomm.sendMessage(new Buffer('Online'));
  }
  
  onMessage(message, rinfo) {
    let header      = message.slice(0, 1)
      , messageId   = message.slice(2, 8)
      , sequence    = message[10]
      , totalSize   = message[11]
      , frameBase64 = message.slice(12, message.length);

    // console.dir(`MessageId: ${messageId} - Sequence: ${sequence} - SequenceSize: ${totalSize} - BufferLength: ${message.length}`);
    
    if (/line/.test(messageId)) {
      return;
    }
  
    if (!this.frameChunks[messageId]) {
      this.frameChunks[messageId] = [];
    }

    this.frameChunks[messageId][sequence] = frameBase64;

    if (this.frameChunks[messageId] && sequence === (totalSize - 1) && this.frameChunks[messageId].length === totalSize) {
      try {
        cv.readImage(new Buffer.concat(this.frameChunks[messageId]), (err, image) => {
          if (!err) {
            this.emit('frame', image);
          } else {
            throw err;
          }
        });
      } catch(e) {
        delete this.frameChunks[messageId];
        console.error('Frame Dropped!');
        console.dir(e.stack);
      }
    }
  }
}

module.exports = VideoStream;
