const { metrics } = require('../metrics');

// In-memory store for active orders and their live tracking state
const activeTrackers = new Map();
const connectedClients = new Set();

/**
 * Initialize GPS tracking simulation for an order
 */
const intervals = new Map();

function startTrackingOrder(order) {
  const startLat = order.restaurantLocation.lat;
  const startLng = order.restaurantLocation.lng;
  const destLat = order.customerLocation.lat;
  const destLng = order.customerLocation.lng;

  const totalSteps = 20; // 20 steps to complete journey
  let currentStep = 0;

  const tracker = {
    orderId: order.id,
    driverName: 'Alex Rivera',
    driverPhone: '+1 (555) 019-2834',
    vehicle: 'Electric Scooter (Plate: FD-882)',
    status: 'PREPARING', // PREPARING -> PICKED_UP -> ON_THE_WAY -> DELIVERED
    currentLocation: { lat: startLat, lng: startLng },
    destination: { lat: destLat, lng: destLng },
    progress: 0,
    startTime: Date.now()
  };

  activeTrackers.set(order.id, tracker);
  metrics.activeOrdersGauge.inc();

  const intervalId = setInterval(() => {
    currentStep++;
    tracker.progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));

    // Update status based on progress
    if (tracker.progress < 25) {
      tracker.status = 'PREPARING';
      tracker.currentLocation = { lat: startLat, lng: startLng };
    } else if (tracker.progress < 40) {
      tracker.status = 'PICKED_UP';
    } else if (tracker.progress < 95) {
      tracker.status = 'ON_THE_WAY';
      // Linear interpolation with slight jitter for GPS realism
      const t = (currentStep - 5) / (totalSteps - 5);
      const lat = startLat + (destLat - startLat) * t + (Math.random() - 0.5) * 0.0005;
      const lng = startLng + (destLng - startLng) * t + (Math.random() - 0.5) * 0.0005;
      tracker.currentLocation = { lat, lng };
    } else {
      tracker.status = 'DELIVERED';
      tracker.currentLocation = { lat: destLat, lng: destLng };
      tracker.progress = 100;
      
      // Stop interval and record duration metric
      clearInterval(intervalId);
      intervals.delete(order.id);
      const durationSeconds = (Date.now() - tracker.startTime) / 1000;
      metrics.orderDeliveryDurationSeconds.observe(durationSeconds);
      metrics.activeOrdersGauge.dec();
    }

    broadcastTrackingUpdate(order.id, tracker);
  }, 2500);

  if (intervalId && typeof intervalId.unref === 'function') {
    intervalId.unref();
  }

  intervals.set(order.id, intervalId);
  return tracker;
}

function broadcastTrackingUpdate(orderId, trackerData) {
  const payload = JSON.stringify({
    type: 'LOCATION_UPDATE',
    orderId,
    data: {
      orderId: trackerData.orderId,
      driverName: trackerData.driverName,
      driverPhone: trackerData.driverPhone,
      vehicle: trackerData.vehicle,
      status: trackerData.status,
      currentLocation: trackerData.currentLocation,
      destination: trackerData.destination,
      progress: trackerData.progress,
      updatedAt: new Date().toISOString()
    }
  });

  connectedClients.forEach(client => {
    if (client.readyState === 1) { // 1 = OPEN in ws
      // If client is subscribed to this order or listening to all
      if (!client.subscribedOrderId || client.subscribedOrderId === orderId) {
        client.send(payload);
      }
    }
  });
}

function handleWebSocketConnection(ws) {
  connectedClients.add(ws);
  metrics.activeWsClientsGauge.set(connectedClients.size);

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'SUBSCRIBE_ORDER') {
        ws.subscribedOrderId = parsed.orderId;
        // Send current state immediately if exists
        if (activeTrackers.has(parsed.orderId)) {
          const tracker = activeTrackers.get(parsed.orderId);
          ws.send(JSON.stringify({
            type: 'LOCATION_UPDATE',
            orderId: parsed.orderId,
            data: tracker
          }));
        }
      }
    } catch (e) {
      console.error('Error handling WebSocket message:', e.message);
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
    metrics.activeWsClientsGauge.set(connectedClients.size);
  });
}

function getTracker(orderId) {
  return activeTrackers.get(orderId) || null;
}

function getAllActiveTrackers() {
  return Array.from(activeTrackers.values());
}

module.exports = {
  startTrackingOrder,
  handleWebSocketConnection,
  getTracker,
  getAllActiveTrackers
};
