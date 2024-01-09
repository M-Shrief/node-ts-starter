import { DataSource } from 'typeorm';
// Config
import { DB } from './config';
// Utils
import { logger } from './utils/logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB.host,
  port: Number(DB.port),
  username: DB.user,
  password: DB.password,
  database: DB.name,
  ssl: DB.ca
    ? {
        rejectUnauthorized: false,
        ca: DB.ca,
      }
    : false,
  synchronize: true,
  logging: true,
  entities: [],
  migrations: [],
  subscribers: [],
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    logger.info(`Connected To Postgres database correctly, Host: ${DB.host}`);
  } catch (error) {
    logger.error('Failed to connect to database');
    process.exit(1);
  }
};

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', async () => {
  await AppDataSource.destroy().catch((err) => logger.error(`${err}`));
  logger.info(
    'Postgres default connection disconnected through app termination',
  );

  process.exit(0);
});
