import { fileURLToPath } from 'url';
import path from 'path';

export const BACKUP_DIR = process.env.BACKUP_DIR || '/app/backups';
export const SCRIPT_DIR = process.env.SCRIPT_DIR || '/app/scripts';
export const WORLD_DIR = process.env.WORLD_DIR || '/app/worlds';
export const CONTAINER_NAME = process.env.CONTAINER_NAME || 'minecraft-server';
export const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';
export const APP_PASSWORD = process.env.APP_PASSWORD || 'app_password';
export const PORT = process.env.PORT || 8080;
export const __dirname = path.dirname(fileURLToPath(import.meta.url));
