import express, {
  Application,
  NextFunction,
  Request,
  Response,
  Router,
} from 'express';
// Config
import { PORT, CORS_ORIGIN } from './config';
// Middlewares
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { errorMiddleware } from './middlewares/errorHandler.middleware';
import { morganMiddleware } from './middlewares/morgan.middleware';
import rateLimit from 'express-rate-limit';
// Utils
import { logger } from './utils/logger';
import {
  isTrustedError,
  handleTrustedError,
} from './utils/errorsCenter/errorHandlers';
// interfaces
import { AppError } from './utils/errorsCenter/appError';
import HttpStatusCode from './utils/httpStatusCode';

export default class App {
  public app: Application;
  public port: string | number;

  constructor(routes: Router[]) {
    this.app = express();
    this.port = PORT || 3000;
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(
        `⚡️[server]: Server is running @ http://localhost:${this.port}`,
      );
    });
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(compression());
    this.app.use(helmet());
    this.app.use(cookieParser());
    this.app.use(
      cors<Request>({
        origin: CORS_ORIGIN,
        methods: ['GET'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      }),
    );
    this.app.use(morganMiddleware);
  }

  private async initializeRoutes(routes: Router[]) {
    // Importing commonjs dynamically, and using {*:*func} because it's a default export
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      message: async (req: Request, res: Response) => {
        res
          .status(429) // too many request
          .send('You can only make 1000 requests every 15 minutes.');
      },
    });

    // Just to test at first, delete when you start developing.
    this.app.get('/', function (req: Request, res: Response, next: NextFunction) {
      res.status(HttpStatusCode.OK).send('Hello World!');
    });
    // Apply the rate limiting middleware to API calls only
    routes.forEach((router) => {
      this.app.use('/api', apiLimiter, router);
    });
  }

  private initializeErrorHandling() {
    // if error is not operational/trusted/known we shall exit then use PM2 to restart.
    process.on('unhandledRejection', (reason: Error) => {
      throw reason;
    });

    process.on('uncaughtException', async (error: Error, res: Response) => {
      if (!isTrustedError(error)) process.exit(1);
      handleTrustedError(error as AppError, res);
    });

    this.app.use(errorMiddleware);
  }
}
