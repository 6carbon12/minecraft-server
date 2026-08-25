import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { setTimeout } from "timers";
import { CONTAINER_NAME } from './constants.js';

export const isValidBackupName = (name) => typeof name === 'string' && /^[a-zA-Z0-9_\-]+$/.test(name);
export const isValidFilename = (filename) => typeof filename === 'string' && !filename.includes('/') && !filename.includes('\\') && !filename.includes('..');

const getCpuTimesFromString = (cpuString) => {
  const parts = cpuString.trim().split(/\s+/);
  parts.shift();

  const cpuNumbers = parts.map(Number);

  // Ensure that there are at least the base 7 columns (user, nice, system, idle, iowait, irq, softirq)
  if (cpuNumbers.length < 7) {
    console.error("Cannot calculate CPU Utilization: Invalid cpu string");
    return null;
  }

  // idle + iowait
  const idleTime = cpuNumbers[3] + cpuNumbers[4];

  // user + nice + system + irq + softirq + steal (index 7, if present)
  let activeTime = cpuNumbers[0] + cpuNumbers[1] + cpuNumbers[2] + cpuNumbers[5] + cpuNumbers[6];
  if (cpuNumbers.length > 7) {
    activeTime += cpuNumbers[7];
  }

  const totalTime = idleTime + activeTime;
  return { idleTime, activeTime, totalTime };
}

const getCpuTimes = () => {
  const output = readFileSync('/proc/stat', 'utf8').trim().split('\n');

  const cpuOverall = output[0];
  const cpuPerCore = output.filter((o) => /^cpu\d+/.test(o));

  const cpu = getCpuTimesFromString(cpuOverall);
  const cores = cpuPerCore.map(getCpuTimesFromString).filter(Boolean);

  return { cpu, cores };
}

const getMinecraftCpu = () => {
  const output = execSync(`docker stats --no-stream --format "{{.CPUPerc}}" ${CONTAINER_NAME}`)
  return output.toString().replace("%", "");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getCpuUtilization = async () => {
  const cpuTimes0 = getCpuTimes();

  if (!cpuTimes0.cpu) {
    return Promise.resolve({ mcCpu: getMinecraftCpu(), cpu: -1, cores: [] });
  }

  return sleep(100).then(() => {
    const cpuTimes1 = getCpuTimes();

    const calculateUtilization = (time0, time1) => {
      const changeInTotal = time1.totalTime - time0.totalTime;
      const changeInIdle = time1.idleTime - time0.idleTime;

      if (changeInTotal === 0) return "0.00";
      return (((changeInTotal - changeInIdle) / changeInTotal) * 100).toFixed(2);
    };

    const cpu = calculateUtilization(cpuTimes0.cpu, cpuTimes1.cpu);

    const cores = cpuTimes1.cores.map((coreTime1, i) => {
      const coreTime0 = cpuTimes0.cores[i];
      return calculateUtilization(coreTime0, coreTime1);
    });

    return {
      mcCpu: getMinecraftCpu(),
      cpu,
      cores,
    };
  });
}

export const getMemUtilization = () => {
  const CONVERSTION_FACTOR = 2 ** 20; // converstion factor frm kibiBytes to GigaBytes
  const output = readFileSync("/proc/meminfo", 'utf8').trim().split('\n');
  const total = parseInt(output[0].split(/\s+/)[1]) / (CONVERSTION_FACTOR);
  const free = parseInt(output[1].split(/\s+/)[1]) / (CONVERSTION_FACTOR);
  const available = parseInt(output[2].split(/\s+/)[1] / (CONVERSTION_FACTOR));
  const cached = parseInt(output[4].split(/\s+/)[1] / (CONVERSTION_FACTOR));
  const used = (total - available);

  return { total, available, used, cached, free };
}
