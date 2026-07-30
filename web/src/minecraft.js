import { SCRIPT_DIR } from './constants.js';
import { execFile } from 'child_process';
import path from 'path';

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
