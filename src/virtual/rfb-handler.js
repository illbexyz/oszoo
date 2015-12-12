const rfb = require('rfb2');
const Jpeg = require('jpeg').Jpeg;
const stampit = require('stampit');

// Start a new connection with the qemu process

const rfbHandler = stampit({
  refs: {
    socket: undefined,
    port: 0,
    initialized: false,
    rfb: undefined
  },
  methods: {
    start: function() {
      this.rfb = rfb.createConnection({
        host: '127.0.0.1',
        port: this.port
      });
      this.socket.on('mouse', (data) => {
        this.rfb.pointerEvent(data.x, data.y, data.isDown);
      });
      this.socket.on('keydown', (data) => {
        this.rfb.keyEvent(data.key, data.keydown);
      });
      this.handleFrames();
    },
    // Stop the current connection and cleanup event listeners
    stop: function() {
      this.socket.removeAllListeners('keydown');
      this.socket.removeAllListeners('mouse');
      this.rfb.end();
    },

    initCanvas: function(rect) {
      this.socket.emit('init', {
        width: rect.width,
        height: rect.height
      });
      this.initialized = true;
    },

    handleFrames: function() {
      this.rfb.on('rect', (rect) => {
        if(!this.initialized) {
          this.initCanvas(rect);
        }
        if(rect.encoding == rfb.encodings.raw){
          // rect.x, rect.y, rect.width, rect.height, rect.data
          // pixmap format is in r.bpp, r.depth, r.redMask, greenMask,
          // blueMask, redShift, greenShift, blueShift
          let rgb = new Buffer(rect.width * rect.height * 3);
          let i = 0;
          let o = 0;
          while(i < rect.data.length) {
            rgb[o++] = rect.data[i + 2];
            rgb[o++] = rect.data[i + 1];
            rgb[o++] = rect.data[i];
            i += 4;
          }
          let image = new Jpeg(rgb, rect.width, rect.height, 'rgb');
          image.encode((img, err) => {
            if(err) {
              console.error(`An error encoding a frame occoured ${err}`);
            }
            if(img && this.socket.connected){
              this.socket.emit('frame', {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                image: img
              });
            }
          });
        }
      });
    }
  }
});

module.exports = (socket, port) => {
  return rfbHandler({socket: socket, port: port});
};