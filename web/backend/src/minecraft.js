import { SCRIPT_DIR, WORLD_DIR } from './constants.js';
import { execFile, spawn } from 'child_process';
import path from 'path';
import fs from "fs/promises"
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import { createInterface } from 'readline';

const processLogs = (logs) => {
  const lines = logs.split('\n');
  const logRegex = /^\[(?<time>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}:\d{3})\s+(?<level>[A-Z]+)\]\s+(?<message>.*)$/;

  const processedLogs = lines.map((line) => {
    const match = line.match(logRegex);
    if (!match) return null;

    const { time, level, message } = match.groups;

    if (message === "") return null;

    return {
      id: randomUUID(),
      time,
      level,
      message: message.trim(),
    };
  });

  return processedLogs.filter(log => log !== null);
}

const processCmdOutput = (logs) => {
  const lines = logs.split('\n');
  const formattingCodeRegex = /§[0-9a-fk-or]/gi;
  const logRegex = /^(?:\[(?<time>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}:\d{3})\s+(?<level>[A-Z]+)\]\s+)?(?<message>.*)$/;

  const processedLogs = lines.map((line) => {
    const match = line.match(logRegex);
    if (!match) return null;

    const { time, level, message } = match.groups;

    if (message === "") return null;

    const messageFormatted = message.replace(formattingCodeRegex, "");

    return {
      id: randomUUID(),
      time,
      level,
      message: messageFormatted.trim(),
    };
  });

  return processedLogs.filter(log => log !== null);
}

export const runCommand = (req, res) => {
  const { command } = req.body;
  const scriptPath = path.join(SCRIPT_DIR, 'send-command.sh');
  const args = [command];

  execFile(scriptPath, args, (error, stdout, _) => {
    if (error) {
      console.error('Failed to execute command:', command, '\nWith error', error);
      return res.status(500).json({ error: 'Failed to execute command.', details: error });
    }
    const output = stdout.trim();
    const outputProcessed = processCmdOutput(output);
    res.json(outputProcessed);
  })
};

export const getLogs = async (req, res) => {
  const scriptPath = path.join(SCRIPT_DIR, 'serverctl.sh');
  const execAsync = promisify(execFile);

  try {
    const { stdout } = await execAsync(scriptPath, ["logs"]);
    const logs = stdout.trim();

    const processedLogs = processLogs(logs);

    res.status(200).json(processedLogs);
  } catch (error) {
    console.error("Failed to execute log command: ", error);
    res.status(500).json({ error: error.message })
  }

};

const logsProc = spawn(path.join(SCRIPT_DIR, 'serverctl.sh'), ["logs-follow"]);
const logStream = createInterface({ input: logsProc.stdout });

export const streamLogs = async (_, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  logStream.on('line', (line) => {
    const processedLogs = processLogs(line);
    if (processedLogs.length === 0) return;

    const response = "event: log\n" + `data: ${JSON.stringify(processedLogs[0])}\n\n`;
    res.write(response);
  })
}

export const getWorldName = async (_, res) => {
  const levelnameFile = path.join(WORLD_DIR, 'main-world/levelname.txt');

  try {
    const worldName = await fs.readFile(levelnameFile, 'utf8');
    return res.status(200).json(worldName)
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: error })
  }
}
