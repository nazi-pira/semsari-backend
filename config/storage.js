import multer from 'multer';
import crypto from 'crypto';
import path from 'path'

import { MONGO_URL } from './config'
import { getGfs as getGridStorage } from "./db"

const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
  url: MONGO_URL,
  file: (_req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          console.log("\n\n >>ERR:", err);
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
export default multer({ storage });

export const getGfs = getGridStorage
