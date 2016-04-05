import vm from './vm';
import { VM_MAX_SESSIONS } from '../config/config';

const vmManager = () => {
  const sessions = new Map();
  let availableSessions = VM_MAX_SESSIONS;

  function start(os) {
    if (availableSessions) {
      const vMachine = vm();
      const vmState = vMachine.start(os);
      sessions.set(vmState.port, { vm: vMachine });
      availableSessions--;
      return {
        state: vmState,
        emitter: vMachine.emitter,
      };
    }
  }

  function stop(port) {
    if (sessions.has(port)) {
      sessions.get(port).vm.stop();
      sessions.delete(port);
      availableSessions++;
    }
  }

  function getAvailableSessions() {
    return availableSessions;
  }

  return {
    start,
    stop,
    getAvailableSessions,
  };
};

export default vmManager();
