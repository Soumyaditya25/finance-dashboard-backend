import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import type { DashboardQuery } from '../validators/dashboard.validators';

function buildDateFilter(from?: string, to?: string): Prisma.FinancialRecordWhereInput {
  if (!from && !to) return {};
  return {
    date: {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to + 'T23:59:59.999Z') }),
    },
  };
}

/**
 * GET /api/dashboard/summary
 * Total income, expenses, net balance, record count — all via DB aggregation.
 */
export async function getSummary(query: DashboardQuery) {
  const dateFilter = buildDateFilter(query.from, query.to);
  const baseWhere = { deletedAt: null, ...dateFilter };

  const [incomeAgg, expenseAgg, recordCount] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { ...baseWhere, type: 'INCOME' },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: { ...baseWhere, type: 'EXPENSE' },
      _sum: { amount: true },
    }),
    prisma.financialRecord.count({ where: baseWhere }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    recordCount,
    ...(query.from || query.to
      ? { period: { from: query.from ?? null, to: query.to ?? null } }
      : {}),
  };
}

/**
 * GET /api/dashboard/by-category
 * Grouped totals by category + percentage of grand total.
 */
export async function getByCategory(query: DashboardQuery) {
  const dateFilter = buildDateFilter(query.from, query.to);
  const where: Prisma.FinancialRecordWhereInput = {
    deletedAt: null,
    ...dateFilter,
    ...(query.type && { type: query.type }),
  };

  const grouped = await prisma.financialRecord.groupBy({
    by: ['category', 'type'],
    where,
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const grandTotal = grouped.reduce(
    (acc, row) => acc + Number(row._sum.amount ?? 0),
    0,
  );

  return grouped.map((row) => {
    const total = Number(row._sum.amount ?? 0);
    return {
      category: row.category,
      type: row.type,
      total,
      percentage: grandTotal > 0 ? Number(((total / grandTotal) * 100).toFixed(2)) : 0,
    };
  });
}

// Raw query result types
type MonthlyRow = {
  year: bigint;
  month: bigint;
  total_income: bigint;
  total_expenses: bigint;
};

type WeeklyRow = {
  year: bigint;
  week: bigint;
  total_income: bigint;
  total_expenses: bigint;
};

/**
 * GET /api/dashboard/trends/monthly
 * GROUP BY year + month — done entirely in SQL.
 */
export async function getMonthlyTrends(query: DashboardQuery) {
  const conditions: string[] = ['r."deletedAt" IS NULL'];
  const params: (string | Date)[] = [];

  if (query.from) {
    params.push(new Date(query.from));
    conditions.push(`r.date >= $${params.length}`);
  }
  if (query.to) {
    params.push(new Date(query.to + 'T23:59:59.999Z'));
    conditions.push(`r.date <= $${params.length}`);
  }

  const whereClause = conditions.join(' AND ');

  const rows = await prisma.$queryRaw<MonthlyRow[]>`
    SELECT
      EXTRACT(YEAR  FROM r.date)::bigint AS year,
      EXTRACT(MONTH FROM r.date)::bigint AS month,
      COALESCE(SUM(CASE WHEN r.type = 'INCOME'  THEN r.amount ELSE 0 END), 0)::bigint AS total_income,
      COALESCE(SUM(CASE WHEN r.type = 'EXPENSE' THEN r.amount ELSE 0 END), 0)::bigint AS total_expenses
    FROM financial_records r
    WHERE ${Prisma.raw(whereClause)}
    GROUP BY year, month
    ORDER BY year ASC, month ASC
  `;

  return rows.map((r) => {
    const totalIncome = Number(r.total_income);
    const totalExpenses = Number(r.total_expenses);
    return {
      year: Number(r.year),
      month: Number(r.month),
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };
  });
}

/**
 * GET /api/dashboard/trends/weekly
 * GROUP BY year + ISO week — done entirely in SQL.
 */
export async function getWeeklyTrends(query: DashboardQuery) {
  const conditions: string[] = ['r."deletedAt" IS NULL'];
  const params: (string | Date)[] = [];

  if (query.from) {
    params.push(new Date(query.from));
    conditions.push(`r.date >= $${params.length}`);
  }
  if (query.to) {
    params.push(new Date(query.to + 'T23:59:59.999Z'));
    conditions.push(`r.date <= $${params.length}`);
  }

  const whereClause = conditions.join(' AND ');

  const rows = await prisma.$queryRaw<WeeklyRow[]>`
    SELECT
      EXTRACT(YEAR FROM r.date)::bigint               AS year,
      EXTRACT(WEEK FROM r.date)::bigint               AS week,
      COALESCE(SUM(CASE WHEN r.type = 'INCOME'  THEN r.amount ELSE 0 END), 0)::bigint AS total_income,
      COALESCE(SUM(CASE WHEN r.type = 'EXPENSE' THEN r.amount ELSE 0 END), 0)::bigint AS total_expenses
    FROM financial_records r
    WHERE ${Prisma.raw(whereClause)}
    GROUP BY year, week
    ORDER BY year ASC, week ASC
  `;

  return rows.map((r) => {
    const totalIncome = Number(r.total_income);
    const totalExpenses = Number(r.total_expenses);
    return {
      year: Number(r.year),
      week: Number(r.week),
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    };
  });
}

/**
 * GET /api/dashboard/recent
 * Last N non-deleted records ordered by date desc.
 */
export async function getRecentActivity(limit: number) {
  return prisma.financialRecord.findMany({
    where: { deletedAt: null },
    orderBy: { date: 'desc' },
    take: limit,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}
