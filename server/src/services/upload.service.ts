import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR } from '../config/uploads.js';
import { AppError } from '../utils/AppError.js';

// Trust file contents, not the client-supplied mimetype/filename. SVG is deliberately not allowed (script risk).
const sniff = (b: Buffer): 'jpg' | 'png' | 'webp' | null => {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.length > 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  return null;
};

export const uploadService = {
  async save(file: Express.Multer.File) {
    const ext = sniff(file.buffer);
    if (!ext) throw new AppError(415, 'UNSUPPORTED_MEDIA', 'Only JPG, PNG or WebP images are allowed.');
    const name = `${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), file.buffer);
    return { url: `/uploads/${name}` };
  },
};