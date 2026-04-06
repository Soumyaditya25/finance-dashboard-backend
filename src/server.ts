import 'dotenv/config';
import './config/env'; // Validate env vars first — will exit if invalid
import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅  Database connected');

    app.listen(env.PORT, () => {
      console.log(`🚀  Server running on http://localhost:${env.PORT}`);
      console.log(`📖  API docs:  http://localhost:${env.PORT}/api-docs`);
      console.log(`🌱  Env:       ${env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌  Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
