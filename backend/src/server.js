const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { register, metrics } = require('./metrics');
const restaurantsRouter = require('./routes/restaurants');
const ordersRouter = require('./routes/orders');
const { handleWebSocketConnection } = require('./services/trackingService');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Prometheus Request Tracking Middleware
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;
    
    // Normalize route path for metrics
    const route = req.baseUrl || req.path || 'unknown';

    metrics.httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(durationSeconds);

    metrics.httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });

  next();
});

// Health Checks
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'food-delivery-backend',
    uptime: process.uptime()
  });
});

app.get('/ready', (req, res) => {
  res.status(200).json({ status: 'READY' });
});

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Application Routes
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/orders', ordersRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Food Delivery System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      restaurants: '/api/restaurants',
      orders: '/api/orders',
      liveWebSocket: '/ws/tracking'
    }
  });
});

// Initialize WebSocket Server for Real-time GPS Tracking
const wss = new WebSocketServer({ server, path: '/ws/tracking' });

wss.on('connection', (ws, req) => {
  console.log(`[WS] New client connected from ${req.socket.remoteAddress}`);
  handleWebSocketConnection(ws);
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Food Delivery API listening on port ${PORT}`);
    console.log(`📊 Prometheus Metrics available at http://0.0.0.0:${PORT}/metrics`);
    console.log(`🛰️  WebSocket GPS tracking available at ws://0.0.0.0:${PORT}/ws/tracking`);
  });
}

module.exports = { app, server };
