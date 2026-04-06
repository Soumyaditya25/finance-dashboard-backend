import request from 'supertest';
import app from '../../src/app';

describe('Health Check API', () => {
  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.env).toBe('test');
  });

  it('handles 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route-12345');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
