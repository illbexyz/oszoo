import fs from 'fs';
import path from 'path';

const configPath = path.join(__dirname, 'config.json');

export function readConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
}

function readConfigSync() {
  const cfg = fs.readFileSync(configPath);
  return JSON.parse(cfg);
}

const config = readConfigSync();

export const x8664Executable =
  config.kvm ? 'kvm' : 'qemu-system-x86_64';

export const VM_MAX_SESSIONS = config.maxSessions;

export const VM_MAX_TIME = config.maxTime;
