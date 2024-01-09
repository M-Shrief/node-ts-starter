import fs from 'fs';
import { logger } from '../utils/logger';

export const DB = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ca: process.env.CA_CERTIFICATE,
};

export const REDIS = process.env.REDIS;

// If you used JWT auth, uncomment this block to read secret from docker-compose
// So I don't want it to exit the application because I don't wan't to break on tests.

// export let JWT_PRIVATE: string = '';

// if (process.env.JWT_PRIVATE_FILE) {
//   JWT_PRIVATE = fs.readFileSync(process.env.JWT_PRIVATE_FILE!).toString().trim()
// } else {
//   logger.warn("JWT Private key is not defined")
// }

export const { NODE_ENV, PORT, LOG_DIR, CORS_ORIGIN } = process.env;
