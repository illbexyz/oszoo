const spawn = require('child_process').spawn;

const qemu = () => {
  const vncPorts = [];
  const vncActivePorts = [];
  const qemuInstances = [];

  for (let i = 0; i < 50; i++) {
    vncPorts.push(i);
  }

  function deallocatePort(port) {
    const index = vncActivePorts.indexOf(port);
    if (index > -1) {
      vncActivePorts.splice(index, 1);
      vncPorts.push(port);
    }
  }

  function allocatePort() {
    const port = vncPorts.pop();
    vncActivePorts.push(port);
    return port;
  }

  function start({ arch, memory, diskImage, cdrom }, callback) {
    let exe;
    // TODO: remaining archs and kvm detection
    switch (arch) {
      case 'x86_64':
        exe = 'qemu-system-x86_64';
        break;
      default:
        throw new Error('No arch defined.');
    }

    const newPort = allocatePort();
    const args = [
      '-m', memory,
      '-vnc', `:${newPort}`,
    ];
    // if (diskImage) {
    //   args.push('-hda');
    //   args.push(`img/${diskImage}`);
    // }
    if (cdrom) {
      args.push('-cdrom');
      args.push(`dist/iso/${cdrom}`);
    }
    args.push('-snapshot');
    qemuInstances[newPort] = spawn(exe, args);
    console.log(args);
    qemuInstances[newPort].on('exit', () => {
      deallocatePort(newPort);
    });
    callback(null, newPort);
  }

  function stop(port) {
    console.log(`Killing qemu on port ${port}`);
    if (qemuInstances[port]) {
      qemuInstances[port].kill();
    }
  }

  return {
    start,
    stop,
  };
};

module.exports = qemu();
