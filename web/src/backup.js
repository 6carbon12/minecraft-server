import fs from 'fs/promises';
import path from 'path';
import { execFile } from 'child_process';
import * as utils from './utils.js';
import {BACKUP_DIR, SCRIPT_DIR} from './constants.js';

export const listBackups = async (req, res) => {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const backupList = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        return { name: file, sizeBytes: stats.size, createdAt: stats.birthtime || stats.mtime };
      })
    );
    res.json(backupList);
  } catch (error) {
    console.error('Failed to list backups:', error);
    res.status(500).json({ error: 'Unable to list backup files.' });
  }
}

export const createBackup = async (req, res) => {
  const { name } = req.body;
  if (name && !utils.isValidBackupName(name)) {
    return res.status(400).json({ error: 'Invalid backup name.' });
  }

  const scriptPath = path.join(SCRIPT_DIR, 'backup.sh');
  const args = name ? [name] : [];

  execFile(scriptPath, args, (error, stdout, stderr) => {
    if (error) {
      console.error('Backup creation error:', error.message);
      return res.status(500).json({ error: 'Backup failed', details: stderr });
    }
    res.json({ message: 'Backup created successfully.', output: stdout.trim() });
  });
}

export const deleteBackup = async (req, res) => {
  const { name } = req.params;
  if (!utils.isValidFilename(name)) return res.status(400).json({ error: 'Invalid file name.' });

  const filePath = path.join(BACKUP_DIR, name);
  try {
    await fs.unlink(filePath);
    res.json({ message: `Backup '${name}' deleted successfully.` });
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ error: 'Backup file not found.' });
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete backup file.' });
  }
}
