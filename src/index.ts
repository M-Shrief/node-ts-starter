import 'reflect-metadata';
import App from './app';
// Databases
import { connectDB } from './db';
import { connectRedis } from './redis';

connectDB();
connectRedis();

// Pass component's router in App constructor.
const app = new App([]);

export default app.listen();
