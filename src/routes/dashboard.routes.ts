import { Router } from 'express';
import * as DashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { dashboardQuerySchema } from '../validators/dashboard.validators';
import { UserRole } from '../types/enums';

export const dashboardRouter = Router();

// All dashboard routes: authenticated + ANALYST or ADMIN
dashboardRouter.use(authenticate, authorize(UserRole.ANALYST, UserRole.ADMIN));

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics endpoints (Analyst + Admin)
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Total income, expenses, net balance and record count
 *     tags: [Dashboard]
 *     parameters:
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Summary data
 */
dashboardRouter.get(
  '/summary',
  validate({ query: dashboardQuerySchema }),
  DashboardController.getSummary,
);

/**
 * @swagger
 * /dashboard/by-category:
 *   get:
 *     summary: Totals grouped by category with percentage
 *     tags: [Dashboard]
 *     parameters:
 *       - { in: query, name: type, schema: { type: string, enum: [INCOME, EXPENSE] } }
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Category breakdown
 */
dashboardRouter.get(
  '/by-category',
  validate({ query: dashboardQuerySchema }),
  DashboardController.getByCategory,
);

/**
 * @swagger
 * /dashboard/trends/monthly:
 *   get:
 *     summary: Monthly income vs expense time series
 *     tags: [Dashboard]
 *     parameters:
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Monthly trend data
 */
dashboardRouter.get(
  '/trends/monthly',
  validate({ query: dashboardQuerySchema }),
  DashboardController.getMonthlyTrends,
);

/**
 * @swagger
 * /dashboard/trends/weekly:
 *   get:
 *     summary: Weekly income vs expense time series
 *     tags: [Dashboard]
 *     parameters:
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: Weekly trend data
 */
dashboardRouter.get(
  '/trends/weekly',
  validate({ query: dashboardQuerySchema }),
  DashboardController.getWeeklyTrends,
);

/**
 * @swagger
 * /dashboard/recent:
 *   get:
 *     summary: Last N transactions (default 10, max 50)
 *     tags: [Dashboard]
 *     parameters:
 *       - { in: query, name: limit, schema: { type: integer, default: 10, maximum: 50 } }
 *     responses:
 *       200:
 *         description: Recent activity
 */
dashboardRouter.get('/recent', DashboardController.getRecentActivity);
