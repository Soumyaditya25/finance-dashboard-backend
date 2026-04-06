import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required' })
    .int('Amount must be an integer')
    .positive('Amount must be a positive integer')
    .max(99999999999, 'Amount exceeds maximum allowed value'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Type is required' }),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(100, 'Category must be at most 100 characters'),
  date: z
    .string({ required_error: 'Date is required' })
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Date must be a valid ISO date' })
    .refine(
      (val) => {
        const d = new Date(val);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 59, 999);
        return d <= tomorrow;
      },
      { message: 'Date cannot be more than 1 day in the future' },
    ),
  notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
});

export const updateRecordSchema = createRecordSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' },
);

export const recordIdParamSchema = z.object({
  id: z.string().uuid('Invalid record ID format'),
});

export const listRecordsQuerySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  from: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'from must be a valid date (YYYY-MM-DD)' })
    .optional(),
  to: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'to must be a valid date (YYYY-MM-DD)' })
    .optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  sort: z.string().optional().default('date:desc'),
  search: z.string().optional(),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
