const express = require('express');
const router = express.Router();
const { restaurants } = require('../data/mockData');
const { startTrackingOrder, getTracker, getAllActiveTrackers } = require('../services/trackingService');
const { metrics } = require('../metrics');

// In-memory orders store
const orders = [];

// GET /api/orders - get all orders
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// GET /api/orders/active - get live tracking for all active orders
router.get('/active', (req, res) => {
  res.json({
    success: true,
    data: getAllActiveTrackers()
  });
});

// GET /api/orders/:id - get order details
router.get('/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  const tracking = getTracker(order.id);
  res.json({
    success: true,
    data: {
      ...order,
      tracking: tracking || null
    }
  });
});

// POST /api/orders - create a new order and trigger GPS tracking
router.post('/', (req, res) => {
  try {
    const { restaurantId, items, customerName, customerAddress, customerLocation } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order data. restaurantId and items are required.'
      });
    }

    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Calculate order subtotal and total
    let subtotal = 0;
    const detailedItems = items.map(itemReq => {
      const menuItem = restaurant.menu.find(m => m.id === itemReq.id) || {
        id: itemReq.id,
        name: itemReq.name || 'Custom Item',
        price: itemReq.price || 10.0
      };
      const qty = itemReq.quantity || 1;
      const itemTotal = menuItem.price * qty;
      subtotal += itemTotal;
      return {
        ...menuItem,
        quantity: qty,
        itemTotal
      };
    });

    const deliveryFee = parseFloat(restaurant.deliveryFee.replace('$', '')) || 2.99;
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = +(subtotal + deliveryFee + tax).toFixed(2);

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // Default customer location around SF city center if not supplied
    const custLoc = customerLocation || {
      lat: 37.7700 + (Math.random() - 0.5) * 0.03,
      lng: -122.4200 + (Math.random() - 0.5) * 0.03
    };

    const newOrder = {
      id: orderId,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantLocation: restaurant.location,
      customerName: customerName || 'Valued Customer',
      customerAddress: customerAddress || '100 Market Street, San Francisco, CA',
      customerLocation: custLoc,
      items: detailedItems,
      subtotal,
      deliveryFee,
      tax,
      total,
      status: 'PLACED',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);

    // Update Prometheus Counter
    if (metrics.ordersTotal) {
      metrics.ordersTotal.labels(restaurant.id, 'PLACED').inc();
    }

    // Start live GPS tracking simulation and WebSocket broadcast
    const tracker = startTrackingOrder(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully and GPS tracker initiated',
      data: {
        order: newOrder,
        tracking: tracker
      }
    });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
