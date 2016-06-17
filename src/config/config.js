const config = {
  kvm: false,
  maxSessions: 2,
  maxTime: 6,
  baseUrl: 'http://localhost',
  httpPort: 8080,
  osDirectory: './os',
};


export const x8664Executable =
  config.kvm ? 'kvm' : 'qemu-system-x86_64';

export const VM_MAX_SESSIONS = config.maxSessions;
export const VM_MAX_TIME = config.maxTime;

export const baseUrl = `${config.baseUrl}:${config.httpPort}`;
export const socketUrl = `${baseUrl}/vm`;
export const apiUrl = `${baseUrl}/api`;
export const osListUrl = `${apiUrl}/os`;

export const httpPort = config.httpPort;
