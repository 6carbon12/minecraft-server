export const isValidBackupName = (name) => typeof name === 'string' && /^[a-zA-Z0-9_\-]+$/.test(name);
export const isValidFilename = (filename) => typeof filename === 'string' && !filename.includes('/') && !filename.includes('\\') && !filename.includes('..');
