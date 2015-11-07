rfb = require('rfb2')
Jpeg = require('jpeg').Jpeg

###* Start a new connection with the qemu process ###

class RfbHandler
  constructor: (socket, port) ->
    @_socket = socket
    @_port = port
    @_initialized = false
    return

  start: ->
    @_rfb = rfb.createConnection(
      host: '127.0.0.1'
      port: @_port)
    @_handleFrames()
    @_handleMouse()
    @_handleKeys()
    return

  # Stop the current connection and cleanup event listeners
  stop: ->
    @_socket.removeAllListeners 'keydown'
    @_socket.removeAllListeners 'mouse'
    @_rfb.end()
    return

  _handleFrames: ->
    self = this
    self._rfb.on 'rect', (rect) ->
      if !self._initialized
        self._socket.emit 'init',
          width: rect.width
          height: rect.height
        self._initialized = true
      if rect.encoding == rfb.encodings.raw
        # rect.x, rect.y, rect.width, rect.height, rect.data
        # pixmap format is in r.bpp, r.depth, r.redMask, greenMask, blueMask, redShift, greenShift, blueShift
        rgb = new Buffer(rect.width * rect.height * 3)
        i = 0
        o = 0
        while i < rect.data.length
          rgb[o++] = rect.data[i + 2]
          rgb[o++] = rect.data[i + 1]
          rgb[o++] = rect.data[i]
          i += 4
        image = new Jpeg(rgb, rect.width, rect.height, 'rgb')
        image.encode (img, err) ->
          if img and self._socket.connected
            self._socket.emit 'frame',
              x: rect.x
              y: rect.y
              width: rect.width
              height: rect.height
              image: img
          return
      return
    return

  _handleMouse: ->
    self = this
    self._socket.on 'mouse', (data) ->
      self._rfb.pointerEvent data.x, data.y, data.isDown
      return
    return

  _handleKeys: ->
    self = this
    self._socket.on 'keydown', (data) ->
      self._rfb.keyEvent data.key, 1
      self._rfb.keyEvent data.key, 0
      return
    return

module.exports = RfbHandler
