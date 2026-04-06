import { Request, Response, NextFunction } from 'express';
import * as UserService from '../services/user.service';
import { sendSuccess } from '../utils/response';

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { users, meta } = await UserService.listUsers(req.query.page, req.query.limit);
    sendSuccess(res, { data: { users }, meta });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await UserService.getUserById(req.params['id'] as string);
    sendSuccess(res, { data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await UserService.createUser(req.body);
    sendSuccess(res, { data: { user }, message: 'User created successfully', statusCode: 201 });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await UserService.updateUser(req.params['id'] as string, req.body);
    sendSuccess(res, { data: { user }, message: 'User updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await UserService.deleteUser(req.params['id'] as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
