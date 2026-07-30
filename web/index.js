import express from 'express';
import path from 'path';
import { authenticateToken, login } from './src/auth.js';
import { listBackups, createBackup, deleteBackup } from './src/backup.js';
import { restore } from './src/restore.js';
import { getServerStatus, startServer, stopServer, restartServer } from './src/server.js';
import { runCommand, getLogs } from './src/minecraft.js';
import { __dirname, PORT } from './src/constants.js'

const app = express();

// MIDDLEWARE
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use('/api/backups', authenticateToken);
app.use('/api/restore', authenticateToken);
app.use('/api/server/start', authenticateToken);
app.use('/api/server/stop', authenticateToken);
app.use('/api/server/restart', authenticateToken);
app.use('/api/minecraft/command', authenticateToken);

// LOGIN
app.post('/api/login', login);

// BACKUP
app.get('/api/backups', listBackups);
app.post('/api/backups', createBackup);
app.delete('/api/backups/:name', deleteBackup);

// RESTORE
app.post('/api/restore', restore);

// SEVER MANAGEMENT
app.get('/api/server/status', getServerStatus);
app.get('/api/server/start', startServer);
app.get('/api/server/stop', stopServer);
app.get('/api/server/restart', restartServer);

// MINECRAFT
app.post('/api/minecraft/command', runCommand);
app.get('/api/minecraft/logs', getLogs);


const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`Backend API active and listening on all interfaces at http://${HOST}:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

