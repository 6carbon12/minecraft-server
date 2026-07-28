import * as utils from './utils.js';
import {BACKUP_DIR, SCRIPT_DIR} from './constants.js';
import { execFile } from 'child_process';

export const restore = (req, res) => {
  const { name } = req.body;
  if (!name || !utils.isValidFilename(name)) {
    return res.status(400).json({ error: 'A valid backup filename is required.' });
  }

  const scriptPath = path.join(SCRIPT_DIR, 'restore.sh');
  const backupFilePath = path.join(BACKUP_DIR, name);

  // Passed backupFilePath instead of just the filename to satisfy RESTORE_FILE check
  execFile(scriptPath, [backupFilePath], (error, stdout, stderr) => {
    if (error) {
      console.error('Restore error:', error.message);
      return res.status(500).json({ error: 'Restore process failed', details: stderr });
    }
    res.json({ message: `Restored server state using '${name}'.`, output: stdout.trim() });
  });
};
