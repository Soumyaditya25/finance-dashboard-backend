import { Request, Response, NextFunction } from 'express';
import * as RecordService from '../services/record.service';
import { sendSuccess } from '../utils/response';

export async function listRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { records, meta } = await RecordService.listRecords({
      ...req.query,
      page: req.query.page,
      limit: req.query.limit,
    });
    sendSuccess(res, { data: { records }, meta });
  } catch (err) {
    next(err);
  }
}

export async function listDeletedRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { records, meta } = await RecordService.listDeletedRecords(req.query.page, req.query.limit);
    sendSuccess(res, { data: { records }, meta });
  } catch (err) {
    next(err);
  }
}

export async function getRecordById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const record = await RecordService.getRecordById(req.params['id'] as string);
    sendSuccess(res, { data: { record } });
  } catch (err) {
    next(err);
  }
}

export async function createRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const record = await RecordService.createRecord(req.body, req.user!.id);
    sendSuccess(res, { data: { record }, message: 'Record created successfully', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const record = await RecordService.updateRecord(req.params['id'] as string, req.body, req.user!.id);
    sendSuccess(res, { data: { record }, message: 'Record updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function softDeleteRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await RecordService.softDeleteRecord(req.params['id'] as string, req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function restoreRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const record = await RecordService.restoreRecord(req.params['id'] as string, req.user!.id);
    sendSuccess(res, { data: { record }, message: 'Record restored successfully' });
  } catch (err) {
    next(err);
  }
}

