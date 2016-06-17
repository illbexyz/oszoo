import { spawn } from 'child_process';

const qemu = ({ x8664Executable, VM_MAX_SESSIONS }) => {
  const vncFreePorts = Array.from(Array(VM_MAX_SESSIONS).keys());
  const vncActivePorts = [];
  const qemuInstances = [];

  function deallocatePort(port) {
    const index = vncActivePorts.indexOf(port);
    if (index > -1) {
      vncActivePorts.splice(index, 1);
      vncFreePorts.unshift(port);
    }
  }

  function allocatePort() {
    const port = vncFreePorts.shift();
    vncActivePorts.push(port);
    return port;
  }

  function start({ arch, memory, diskImage, cdrom }) {
    let exe;
    switch (arch) {
      case 'x86_64':
        exe = x8664Executable;
        break;
      case 'arm':
        exe = 'qemu-system-arm';
        break;
      default:
        throw new Error('No arch defined.');
    }

    const newPort = allocatePort();
    const args = [
      '-m', memory,
      '-vnc', `:${newPort}`,
    ];
    if (diskImage) {
      args.push('-hda');
      args.push(`dist/img/${diskImage}`);
    }
    if (cdrom) {
      args.push('-cdrom');
      args.push(`dist/iso/${cdrom}`);
    }
    args.push('-snapshot');
    qemuInstances[newPort] = spawn(exe, args);
    console.log(`Starting port ${newPort}`);
    qemuInstances[newPort].on('exit', () => {
      deallocatePort(newPort);
    });
    return newPort;
  }

  function stop(port) {
    console.log(`Stopping port ${port}`);
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
