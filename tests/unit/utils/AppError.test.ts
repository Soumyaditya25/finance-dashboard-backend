import { AppError } from '../../../src/utils/AppError';

describe('AppError', () => {
  it('instantiates correctly with message, statusCode, and code', () => {
    const error = new AppError('Something went wrong', 500, 'INTERNAL_SERVER_ERROR');

    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
  });

  it('provides a notFound utility method', () => {
    const error = AppError.notFound('User');
    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('provides an unauthorized utility method', () => {
    const error = AppError.unauthorized();
    expect(error.message).toBe('Unauthorized');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('provides a forbidden utility method', () => {
    const error = AppError.forbidden();
    expect(error.message).toBe('You do not have permission to perform this action');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('provides a conflict utility method', () => {
    const error = AppError.conflict('Email already exists');
    expect(error.message).toBe('Email already exists');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  it('provides a badRequest utility method', () => {
    const error = AppError.badRequest('Invalid input');
    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
  });
});
