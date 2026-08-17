import * as utils from './utils.js';
import path from 'path';
import fs from "fs/promises"
import { BACKUP_DIR, SCRIPT_DIR } from './constants.js';
import { execFile } from 'child_process';

export const restore = (req, res) => {
  const { name } = req.params;
  if (!name || !utils.isValidFilename(name)) {
    return res.status(400).json({ error: 'A valid backup filename is required.' });
  }

  const scriptPath = path.join(SCRIPT_DIR, 'restore.sh');
  const backupFilePath = path.join(BACKUP_DIR, name);

  // Passed backupFilePath instead of just the filename to satisfy RESTORE_FILE check
  execFile(scriptPath, [backupFilePath], (error, stdout, stderr) => {
    if (error) {
      console.error('Restore error:', error.message);
      return res.status(500).json({ error: "Restore error." });
    }
    res.json({ message: `Restored server state using '${name}'.` });
  });
};

export const getLatestRestore = async (_, res) => {
  try {
    const last_restore = path.join(SCRIPT_DIR, ".latest_restored");
    const lastRestoredFile = await fs.readFile(last_restore, 'utf8');
    console.log(lastRestoredFile);

    res.status(200).json(lastRestoredFile )
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to get last restored file."});
  }
}
