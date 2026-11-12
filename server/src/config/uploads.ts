import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const UPLOAD_DIR = fileURLToPath(new URL('../../uploads', import.meta.url));
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const PRIVATE_DIR = fileURLToPath(new URL('../../private-uploads', import.meta.url));
fs.mkdirSync(PRIVATE_DIR, { recursive: true });