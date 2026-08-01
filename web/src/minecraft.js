import { SCRIPT_DIR, WORLD_DIR } from './constants.js';
import { execFile } from 'child_process';
import path from 'path';
import fs from "fs/promises"
import { promisify } from 'util';
import { randomUUID } from 'crypto';

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

export const runCommand = (req, res) => {
  const { command } = req.body;
  const scriptPath = path.join(SCRIPT_DIR, 'send-command.sh');
  const args = [command];
  console.log(command);
  console.log(req.body);

  execFile(scriptPath, args, (error, stdout, _) => {
    if (error) {
      console.error('Failed to execute command:', command, '\nWith error', error);
      return res.status(500).json({ error: 'Failed to execute command.', details: error });
    }
    console.log(stdout.trim());
    res.json({ output: stdout.trim() });
  })
};

export const getLogs = async (req, res) => {
  const scriptPath = path.join(SCRIPT_DIR, 'serverctl.sh');
  const execAsync = promisify(execFile);

  try {
    const { stdout } = await execAsync(scriptPath, ["logs"]);
    const logs = stdout.trim();

    const processedLogs = processLogs(logs);

    res.status(200).json({ logs: processedLogs });
  } catch (error) {
    console.error("Failed to execute log command: ", error);
    res.status(500).json({ message: error.message })
  }

};

export const getWorldName = async (_, res) => {
  const levelnameFile = path.join(WORLD_DIR, 'main-world/levelname.txt');

  try {
    const worldName = await fs.readFile(levelnameFile, 'utf8');
    return res.status(200).json({worldName})
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: error })
  }
}
