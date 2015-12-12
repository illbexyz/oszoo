const spawn = require('child_process').spawn;
const stampit = require('stampit');

const qemu = stampit({
  init: function() {
    this.vncPorts = [];
    this.vncActivePorts = [];
    this.qemu = [];
    let i = 0;
    while(i <= 50){
      this.vncPorts.push(i);
      i++;
    }
  }, 
  refs: {
    vncPorts: [],
    vncActivePorts: [],
    qemu: []
  },
  methods: {
    start: function(config, callback) {
      let exe;
      let port;
      let args;
      // TODO: remaining archs and kvm detection
      if(config.arch == 'x86_64'){
        exe = 'qemu-system-x86_64';
      }

      port = this.port();
      args = [
        '-m', config.memory,
        '-vnc', ':' + port
      ];
      if(config.diskImage) {
        args.push('-hda');
        args.push('img/' + config.diskImage);
      }
      console.log(config);
      if(config.cdrom) {
        args.push('-cdrom');
        args.push('iso/' + config.cdrom);
      }
      args.push('-snapshot');
      this.qemu[port] = spawn(exe, args);
      this.qemu[port].on('exit', () => {
        this.reallocatePort(port);
      });
      console.log(args);
      setTimeout(() => {
        console.log('port in callback: '+ port);
        callback(null, port);
      }, 1000);
    },

    stop: function(port) {
      console.log('Killing qemu on port' + port);
      if(this.qemu[port]){
        this.qemu[port].kill();
      }
    },

    reallocatePort: function(port) {
      console.log('port ' + port + ' reallocated');
      let index = this.vncActivePorts.indexOf(port);
      if(index > -1) {
        this.vncActivePorts.splice(index, 1);
        this.vncPorts.push(port);
      }
    },

    port: function() {
      let port = this.vncPorts.pop();
      this.vncActivePorts.push(port);
      return port;
    }
  }
});

module.exports = qemu();
