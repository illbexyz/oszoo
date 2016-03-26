import { spawn } from 'child_process';

const qemu = ({ x8664Executable, VM_MAX_SESSIONS }) => {
  const vncPorts = [];
  const vncActivePorts = [];
  const qemuInstances = [];

  for (let i = 0; i < VM_MAX_SESSIONS; i++) {
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
    const port = vncPorts.shift();
    vncActivePorts.push(port);
    return port;
  }

  function start({ arch, memory, diskImage, cdrom }) {
    let exe;
    // TODO: remaining archs
    switch (arch) {
      case 'x86_64':
        exe = x8664Executable;
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
    console.log(exe, args);
    console.log(`Starting qemu on port ${newPort}`);
    qemuInstances[newPort].on('exit', () => {
      deallocatePort(newPort);
    });
    return newPort;
  }

  function stop(port) {
    console.log(`Stopping qemu on port ${port}`);
    if (qemuInstances[port]) {
      qemuInstances[port].kill();
    }
  }

  return {
    start,
    stop,
  };
};

export default qemu;
