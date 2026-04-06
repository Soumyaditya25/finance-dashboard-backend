import { PrismaClient } from '@prisma/client';
import * as dashboardService from '../../../src/services/dashboard.service';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    financialRecord: {
      aggregate: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mPrismaClient),
    Prisma: {
      raw: jest.fn((str) => str),
    },
  };
});

const prisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should aggregate income, expenses, and count records', async () => {
      // Setup mock responses
      (prisma.financialRecord.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { amount: 500000n } }) // Income
        .mockResolvedValueOnce({ _sum: { amount: 20000n } }); // Expense
      
      (prisma.financialRecord.count as jest.Mock).mockResolvedValue(10);

      const result = await dashboardService.getSummary({});

      expect(prisma.financialRecord.aggregate).toHaveBeenCalledTimes(2);
      expect(prisma.financialRecord.count).toHaveBeenCalledTimes(1);
      
      expect(result).toEqual({
        totalIncome: 500000,
        totalExpenses: 20000,
        netBalance: 480000,
        recordCount: 10,
      });
    });

    it('should return 0s when no records exist', async () => {
      (prisma.financialRecord.aggregate as jest.Mock)
        .mockResolvedValueOnce({ _sum: { amount: null } })
        .mockResolvedValueOnce({ _sum: { amount: null } });
      
      (prisma.financialRecord.count as jest.Mock).mockResolvedValue(0);

      const result = await dashboardService.getSummary({});

      expect(result).toEqual({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        recordCount: 0,
      });
    });

    it('should apply date filters correctly', async () => {
      (prisma.financialRecord.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 100n } });
      (prisma.financialRecord.count as jest.Mock).mockResolvedValue(1);

      const from = '2023-01-01';
      const to = '2023-01-31';
      const result = await dashboardService.getSummary({ from, to });

      expect(result.period).toEqual({ from, to });
      
      // Verify aggregate was called with correct date formatting
      expect(prisma.financialRecord.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: new Date(from),
              lte: new Date(to + 'T23:59:59.999Z'),
            },
          }),
        })
      );
    });
  });
});
