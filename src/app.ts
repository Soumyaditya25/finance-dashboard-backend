import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { router } from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/AppError';

const app: Application = express();

// ─── Security & Common Middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── BigInt JSON Serialisation ─────────────────────────────────────────────────
// Express uses JSON.stringify under the hood; BigInt is not natively serialisable.
// Patch the replacer globally so controllers don't need to worry about it.
const _json = (res: Response) => {
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    const serialised = JSON.parse(
      JSON.stringify(body, (_key, value) =>
        typeof value === 'bigint' ? Number(value) : value,
      ),
    );
    return originalJson(serialised);
  };
  return res;
};
app.use((_req: Request, res: Response, next: NextFunction) => {
  _json(res);
  next();
});

// ─── API Docs ─────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', router);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(AppError.notFound('Route'));
});

// ─── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

export default app;
