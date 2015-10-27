spawn = require('child_process').spawn
randomstring = require('randomstring')

class Qemu
  constructor: ->
    @_vncPorts = []
    @_vncActivePorts = []
    @_qemu = []
    i = 0
    while i <= 50
      @_vncPorts.push i
      i++
    return

  start: (config, callback) ->
    exe = undefined
    if config.arch == 'x86_64'
      exe = 'qemu-system-x86_64'
    password = randomstring.generate(length: 12)
    port = @_port()
    self = this
    args = [
      '-m'
      config.memory
      '-vnc'
      ':' + port
    ]
    if config.diskImage
      args.push '-hda'
      args.push 'img/' + config.diskImage
    if config.cdrom
      args.push '-cdrom'
      args.push 'iso/' + config.cdrom
    args.push '-snapshot'
    @_qemu[port] = spawn(exe, args)
    @_qemu[port].on 'exit', ->
      self._reallocatePort port
      return
    console.log args
    setTimeout (->
      callback null, port
    ), 1000
    return

  stop: (port) ->
    console.log 'Killing qemu on port' + port
    if @_qemu[port]
      @_qemu[port].kill()
    return

  _reallocatePort: (port) ->
    console.log 'port ' + port + ' reallocated'
    index = @_vncActivePorts.indexOf(port)
    if index > -1
      @_vncActivePorts.splice index, 1
      @_vncPorts.push port
    return

  _port: ->
    port = @_vncPorts.pop()
    @_vncActivePorts.push port
    port

qemu = new Qemu
module.exports = qemu
