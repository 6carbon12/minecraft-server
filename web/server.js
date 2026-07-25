import express from 'express';
import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';
const APP_PASSWORD = process.env.APP_PASSWORD || 'app_password';

// SECURITY STUFF
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === APP_PASSWORD) {
    // Issue a JWT valid for 24 hours
    const token = jwt.sign({ authorized: true }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

app.use('/api/backups', authenticateToken);
app.use('/api/restore', authenticateToken);

const BACKUP_DIR = '/app/backups';
const SCRIPT_DIR = '/app/scripts';

const isValidBackupName = (name) => typeof name === 'string' && /^[a-zA-Z0-9_\-]+$/.test(name);
const isValidFilename = (filename) => typeof filename === 'string' && !filename.includes('/') && !filename.includes('\\') && !filename.includes('..');

// 1. LIST BACKUPS
app.get('/api/backups', async (_, res) => {
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
});

// 2. CREATE BACKUP
app.post('/api/backups', (req, res) => {
  const { name } = req.body;
  if (name && !isValidBackupName(name)) {
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
});

// 3. DELETE BACKUP
app.delete('/api/backups/:name', async (req, res) => {
  const { name } = req.params;
  if (!isValidFilename(name)) return res.status(400).json({ error: 'Invalid file name.' });

  const filePath = path.join(BACKUP_DIR, name);
  try {
    await fs.unlink(filePath);
    res.json({ message: `Backup '${name}' deleted successfully.` });
  } catch (error) {
    if (error.code === 'ENOENT') return res.status(404).json({ error: 'Backup file not found.' });
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete backup file.' });
  }
});

// 4. RESTORE BACKUP
app.post('/api/restore', (req, res) => {
  const { name } = req.body;
  if (!name || !isValidFilename(name)) {
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
});

const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Backend API active and listening on all interfaces at http://${HOST}:${PORT}`);
});
