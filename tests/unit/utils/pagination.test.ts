import { parsePagination, buildMeta } from '../../../src/utils/pagination';

describe('Pagination Utils', () => {
  describe('parsePagination', () => {
    it('returns default page and limit if none provided', () => {
      const result = parsePagination(undefined, undefined);
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it('parses valid page and limit', () => {
      const result = parsePagination('2', '10');
      expect(result).toEqual({ page: 2, limit: 10, skip: 10 });
    });

    it('caps limit to maxLimit', () => {
      const result = parsePagination('1', '200');
      expect(result).toEqual({ page: 1, limit: 100, skip: 0 }); // Default maxLimit is 100
    });

    it('handles negative or zero values by resetting to minimum valid numbers', () => {
      const result = parsePagination('-5', '0');
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });

    it('handles string input safely', () => {
      const result = parsePagination('invalid', 'NaN');
      expect(result).toEqual({ page: 1, limit: 20, skip: 0 });
    });
  });

  describe('buildMeta', () => {
    it('correctly builds metadata when total is evenly divisible by limit', () => {
      const result = buildMeta(1, 10, 50);
      expect(result).toEqual({ page: 1, limit: 10, total: 50, totalPages: 5 });
    });

    it('correctly calculates totalPages when there is a remainder', () => {
      const result = buildMeta(2, 10, 25);
      expect(result).toEqual({ page: 2, limit: 10, total: 25, totalPages: 3 });
    });

    it('handles zero total correctly', () => {
      const result = buildMeta(1, 10, 0);
      expect(result).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    });
  });
});
