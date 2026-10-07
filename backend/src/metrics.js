const client = require('prom-client');

// Initialize registry
const register = new client.Registry();

// Enable collection of default metrics (heap, cpu, event loop, etc.)
client.collectDefaultMetrics({ register, prefix: 'food_delivery_' });

// Custom Prometheus Metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'food_delivery_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'food_delivery_http_requests_total',
  help: 'Total number of HTTP requests made',
  labelNames: ['method', 'route', 'status_code']
});

const ordersTotal = new client.Counter({
  name: 'food_delivery_orders_total',
  help: 'Total count of food delivery orders placed',
  labelNames: ['restaurant_id', 'status']
});

const activeOrdersGauge = new client.Gauge({
  name: 'food_delivery_active_orders',
  help: 'Number of currently active/in-flight orders'
});

const activeWsClientsGauge = new client.Gauge({
  name: 'food_delivery_active_ws_clients',
  help: 'Number of active WebSocket tracking connections'
});

const orderDeliveryDurationSeconds = new client.Histogram({
  name: 'food_delivery_order_delivery_duration_seconds',
  help: 'Time taken from order placement to delivery in seconds',
  buckets: [10, 30, 60, 120, 300, 600]
});

// Register custom metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(ordersTotal);
register.registerMetric(activeOrdersGauge);
register.registerMetric(activeWsClientsGauge);
register.registerMetric(orderDeliveryDurationSeconds);

module.exports = {
  register,
  metrics: {
    httpRequestDurationMicroseconds,
    httpRequestsTotal,
    ordersTotal,
    activeOrdersGauge,
    activeWsClientsGauge,
    orderDeliveryDurationSeconds
  }
};
