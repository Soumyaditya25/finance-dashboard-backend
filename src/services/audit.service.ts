import { prisma } from '../config/prisma';

type AuditLogInput = {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  entity: 'FinancialRecord' | 'User';
  entityId: string;
  userId: string;
  oldData?: unknown;
  newData?: unknown;
};

export async function createAuditLog(data: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        userId: data.userId,
        oldData: data.oldData ? JSON.stringify(data.oldData, (_, v) => typeof v === 'bigint' ? v.toString() : v) : null,
        newData: data.newData ? JSON.stringify(data.newData, (_, v) => typeof v === 'bigint' ? v.toString() : v) : null,
      },
    });
  } catch (err) {
    // We intentionally catch and swallow audit log errors so they don't break the main business flow,
    // but in a production environment, this should ideally be piped to Datadog/Sentry.
    console.error('Audit Log Failed to Save:', err);
  }
}
