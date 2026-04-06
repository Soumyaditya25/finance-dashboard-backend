import { Router } from 'express';
import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { recordRouter } from './record.routes';
import { dashboardRouter } from './dashboard.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/records', recordRouter);
router.use('/dashboard', dashboardRouter);
