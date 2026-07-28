import express from 'express';
import path from 'path';
import { authenticateToken, login } from './src/auth.js';
import { listBackups, createBackup, deleteBackup } from './src/backup.js';
import { restore } from './src/restore.js';
import {__dirname, PORT} from './src/constants.js'

const app = express();

// MIDDLEWARE
app.use(express.static(path.join(__dirname, '../public')));
console.log(path.join(__dirname, 'public'));
app.use(express.json());
app.use('/api/backups', authenticateToken);
app.use('/api/restore', authenticateToken);
app.use('/api/command', authenticateToken);

// LOGIN
app.post('/api/login', login);

// BACKUP
app.get('/api/backups', listBackups);
app.post('/api/backups', createBackup);
app.delete('/api/backups/:name', deleteBackup);

// RESTORE
app.post('/api/restore', restore);

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Starting graceful shutdown...');

  // 1. Stop accepting new connections
  app.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Enforce a hard timeout fallback if things hang
  setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000); 
});


const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Backend API active and listening on all interfaces at http://${HOST}:${PORT}`);
});
