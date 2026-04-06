import { Request, Response, NextFunction } from 'express';
import * as DashboardService from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await DashboardService.getSummary(req.query as never);
    sendSuccess(res, { data });
  } catch (err) {
    next(err);
  }
}

export async function getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await DashboardService.getByCategory(req.query as never);
    sendSuccess(res, { data: { categories } });
  } catch (err) {
    next(err);
  }
}

export async function getMonthlyTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trends = await DashboardService.getMonthlyTrends(req.query as never);
    sendSuccess(res, { data: { trends } });
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trends = await DashboardService.getWeeklyTrends(req.query as never);
    sendSuccess(res, { data: { trends } });
  } catch (err) {
    next(err);
  }
}

export async function getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const records = await DashboardService.getRecentActivity(limit);
    sendSuccess(res, { data: { records, count: records.length } });
  } catch (err) {
    next(err);
  }
}
