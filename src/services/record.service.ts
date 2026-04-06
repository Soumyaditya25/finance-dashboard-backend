import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { CreateRecordInput, UpdateRecordInput } from '../validators/record.validators';
import { createAuditLog } from './audit.service';

function parseSort(sort: string): { field: string; direction: 'asc' | 'desc' } {
  const [field, dir] = sort.split(':');
  const allowedFields = ['date', 'amount', 'category', 'createdAt', 'type'];
  const safeField = allowedFields.includes(field) ? field : 'date';
  const direction = dir === 'asc' ? 'asc' : 'desc';
  return { field: safeField, direction };
}

export async function listRecords(query: {
  type?: string;
  category?: string;
  from?: string;
  to?: string;
  page?: unknown;
  limit?: unknown;
  sort?: string;
  search?: string;
}) {
  const { page, limit, skip } = parsePagination(query.page, query.limit, 100);
  const { field, direction } = parseSort(query.sort ?? 'date:desc');

  const where = {
    deletedAt: null as Date | null,
    ...(query.type && { type: query.type as 'INCOME' | 'EXPENSE' }),
    ...(query.category && {
      category: { contains: query.category, mode: 'insensitive' as const },
    }),
    ...(query.search && {
      notes: { contains: query.search, mode: 'insensitive' as const },
    }),
    ...((query.from || query.to) && {
      date: {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to + 'T23:59:59.999Z') }),
      },
    }),
  };

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      orderBy: { [field]: direction },
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return { records, meta: buildMeta(page, limit, total) };
}

export async function listDeletedRecords(rawPage: unknown, rawLimit: unknown) {
  const { page, limit, skip } = parsePagination(rawPage, rawLimit, 100);

  const where = { deletedAt: { not: null as Date | null } };

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      orderBy: { deletedAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return { records, meta: buildMeta(page, limit, total) };
}

export async function getRecordById(id: string) {
  const record = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!record) throw AppError.notFound('Financial record');
  return record;
}

export async function createRecord(data: CreateRecordInput, userId: string) {
  const record = await prisma.financialRecord.create({
    data: {
      amount: BigInt(data.amount),
      type: data.type,
      category: data.category,
      date: new Date(data.date),
      notes: data.notes,
      createdBy: userId,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await createAuditLog({
    action: 'CREATE',
    entity: 'FinancialRecord',
    entityId: record.id,
    userId,
    newData: record,
  });

  return record;
}

export async function updateRecord(id: string, data: UpdateRecordInput, userId: string) {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw AppError.notFound('Financial record');

  const updated = await prisma.financialRecord.update({
    where: { id },
    data: {
      ...(data.amount !== undefined && { amount: BigInt(data.amount) }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await createAuditLog({
    action: 'UPDATE',
    entity: 'FinancialRecord',
    entityId: updated.id,
    userId,
    oldData: existing,
    newData: updated,
  });

  return updated;
}

export async function softDeleteRecord(id: string, userId: string): Promise<void> {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) throw AppError.notFound('Financial record');

  const deleted = await prisma.financialRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    action: 'DELETE',
    entity: 'FinancialRecord',
    entityId: deleted.id,
    userId,
    oldData: existing,
    newData: deleted,
  });
}

export async function restoreRecord(id: string, userId: string) {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: { not: null } },
  });
  if (!existing) {
    throw new AppError(
      'Record not found or is not deleted',
      404,
      'NOT_FOUND',
    );
  }

  const restored = await prisma.financialRecord.update({
    where: { id },
    data: { deletedAt: null },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await createAuditLog({
    action: 'RESTORE',
    entity: 'FinancialRecord',
    entityId: restored.id,
    userId,
    oldData: existing,
    newData: restored,
  });

  return restored;
}
