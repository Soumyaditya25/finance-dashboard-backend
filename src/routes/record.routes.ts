import { Router } from 'express';
import * as RecordController from '../controllers/record.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createRecordSchema,
  updateRecordSchema,
  recordIdParamSchema,
  listRecordsQuerySchema,
} from '../validators/record.validators';
import { UserRole } from '../types/enums';

export const recordRouter = Router();

// All record routes require authentication
recordRouter.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records management
 */

/**
 * @swagger
 * /records:
 *   get:
 *     summary: List financial records with filters and pagination
 *     tags: [Records]
 *     parameters:
 *       - { in: query, name: type, schema: { type: string, enum: [INCOME, EXPENSE] } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: from, schema: { type: string, format: date } }
 *       - { in: query, name: to, schema: { type: string, format: date } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: sort, schema: { type: string, example: "date:desc" } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200:
 *         description: Paginated list of records
 */
recordRouter.get(
  '/',
  authorize(UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN),
  validate({ query: listRecordsQuerySchema }),
  RecordController.listRecords,
);

/**
 * @swagger
 * /records/deleted:
 *   get:
 *     summary: List soft-deleted records (Admin only)
 *     tags: [Records]
 *     responses:
 *       200:
 *         description: Paginated list of deleted records
 */
// NOTE: /deleted must be registered BEFORE /:id to avoid route conflict
recordRouter.get(
  '/deleted',
  authorize(UserRole.ADMIN),
  RecordController.listDeletedRecords,
);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get a specific financial record
 *     tags: [Records]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Financial record object
 *       404:
 *         description: Record not found or soft-deleted
 */
recordRouter.get(
  '/:id',
  authorize(UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN),
  validate({ params: recordIdParamSchema }),
  RecordController.getRecordById,
);

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create a new financial record (Admin only)
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount: { type: integer, description: "In smallest currency unit (paise/cents)" }
 *               type: { type: string, enum: [INCOME, EXPENSE] }
 *               category: { type: string }
 *               date: { type: string, format: date }
 *               notes: { type: string, maxLength: 1000 }
 *     responses:
 *       201:
 *         description: Record created
 */
recordRouter.post(
  '/',
  authorize(UserRole.ADMIN),
  validate({ body: createRecordSchema }),
  RecordController.createRecord,
);

/**
 * @swagger
 * /records/{id}:
 *   patch:
 *     summary: Update a financial record (Admin only)
 *     tags: [Records]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Record updated
 *       404:
 *         description: Record not found
 */
recordRouter.patch(
  '/:id',
  authorize(UserRole.ADMIN),
  validate({ params: recordIdParamSchema, body: updateRecordSchema }),
  RecordController.updateRecord,
);

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Soft-delete a financial record (Admin only)
 *     tags: [Records]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       204:
 *         description: Record soft-deleted
 *       404:
 *         description: Record not found
 */
recordRouter.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validate({ params: recordIdParamSchema }),
  RecordController.softDeleteRecord,
);

/**
 * @swagger
 * /records/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted record (Admin only)
 *     tags: [Records]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Record restored
 *       404:
 *         description: Record not found or not deleted
 */
recordRouter.post(
  '/:id/restore',
  authorize(UserRole.ADMIN),
  validate({ params: recordIdParamSchema }),
  RecordController.restoreRecord,
);
