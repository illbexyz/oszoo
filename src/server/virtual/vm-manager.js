import vm from './vm';
import { VM_MAX_SESSIONS } from '../config/config';

const vmManager = () => {
  const sessions = {};
  let availableSessions = VM_MAX_SESSIONS;

  function start(os) {
    const vMachine = vm();
    const vmState = vMachine.start(os);
    sessions[vMachine.port] = {
      state: vmState,
      vm: vMachine,
    };
    availableSessions--;
    return vMachine;
  }

  function stop(port) {
    sessions[port].vm.stop();
    sessions[port] = {};
    availableSessions++;
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
