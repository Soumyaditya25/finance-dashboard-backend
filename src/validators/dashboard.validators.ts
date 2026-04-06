import { z } from 'zod';

const dateString = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), { message: 'Must be a valid date string (YYYY-MM-DD)' });

export const dashboardQuerySchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
});

export const recentQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .pipe(z.number().min(1).max(50)),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
export type RecentQuery = z.infer<typeof recentQuerySchema>;
