const request = require('supertest');
const { app } = require('../src/server');

describe('Food Delivery API Endpoints', () => {
  it('GET /health returns status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  it('GET /metrics exposes Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('food_delivery_');
  });

  it('GET /api/restaurants returns a list of restaurants', async () => {
    const res = await request(app).get('/api/restaurants');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/orders creates a new order and starts tracking', async () => {
    const newOrderPayload = {
      restaurantId: 'rest-1',
      customerName: 'DevOps Tester',
      customerAddress: '456 Innovation Way',
      items: [
        { id: 'item-101', quantity: 2 },
        { id: 'item-102', quantity: 1 }
      ]
    };

    const res = await request(app)
      .post('/api/orders')
      .send(newOrderPayload);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order.id).toBeDefined();
    expect(res.body.data.order.total).toBeGreaterThan(0);
    expect(res.body.data.tracking.status).toBe('PREPARING');
  });

  it('GET /api/orders retrieves active and historical orders', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
