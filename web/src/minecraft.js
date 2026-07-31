import { SCRIPT_DIR, WORLD_DIR } from './constants.js';
import { execFile } from 'child_process';
import path from 'path';
import fs from "fs/promises"

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

export const getLogs = (_, res) => {
  const scriptPath = path.join(SCRIPT_DIR, 'serverctl.sh');

  execFile(scriptPath, ["logs"], (error, stdout, _) => {
    if (error) {
      console.error('Failed to get logs.', error);
      return res.status(500).json({ error: 'Failed to get logs.', details: error });
    }

    res.json({ logs: stdout });
  })
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
