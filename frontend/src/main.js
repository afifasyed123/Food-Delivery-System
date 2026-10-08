import './styles/main.css';

// API Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000' 
  : window.location.origin;

const WS_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'ws://localhost:5000/ws/tracking'
  : `ws://${window.location.host}/ws/tracking`;

// Application State
let currentTab = 'restaurants'; // 'restaurants' | 'tracking'
let restaurants = [];
let filteredRestaurants = [];
let activeCategory = 'All';
let searchQuery = '';
let cart = [];
let activeOrder = null;
let activeTracking = null;
let ws = null;
let isCartOpen = false;
let canvasAnimId = null;

// Map Coordinates for GPS simulation canvas
const MAP_CONFIG = {
  width: 600,
  height: 420,
  restX: 80,
  restY: 340,
  custX: 520,
  custY: 80
};

async function init() {
  renderAppLayout();
  await loadRestaurants();
  setupWebSocket();
}

// WebSocket Setup for Real-time GPS stream
function setupWebSocket() {
  try {
    ws = new WebSocket(WS_BASE);

    ws.onopen = () => {
      if (activeOrder) {
        ws.send(JSON.stringify({ type: 'SUBSCRIBE_ORDER', orderId: activeOrder.id }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'LOCATION_UPDATE') {
          handleTrackingUpdate(message.data);
        }
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    ws.onclose = () => {
      setTimeout(setupWebSocket, 3000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
    };
  } catch (err) {
    console.error('WebSocket init error:', err);
  }
}

async function loadRestaurants() {
  try {
    const res = await fetch(`${API_BASE}/api/restaurants`);
    const data = await res.json();
    if (data.success) {
      restaurants = data.data;
      filteredRestaurants = [...restaurants];
      renderRestaurantsGrid();
    }
  } catch (e) {
    console.error('Failed to load restaurants:', e);
  }
}

// Render Top Layout
function renderAppLayout() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav class="navbar">
      <div class="brand" id="nav-brand">
        <div class="brand-symbol">Q<span>.</span></div>
        <div class="brand-text">
          <span class="brand-name">QuickBite</span>
          <span class="brand-tagline">Artisan Delivery</span>
        </div>
      </div>

      <div class="nav-center">
        <button class="nav-tab-btn ${currentTab === 'restaurants' ? 'active' : ''}" data-tab="restaurants">
          Restaurants & Menus
        </button>
        <button class="nav-tab-btn ${currentTab === 'tracking' ? 'active' : ''}" data-tab="tracking">
          Live Delivery Tracker
        </button>
      </div>

      <button class="cart-pill-btn" id="cart-btn">
        <span>Cart</span>
        <span class="cart-counter" id="cart-count">0</span>
      </button>
    </nav>

    <main class="main-wrapper" id="main-view">
      <!-- Dynamic Content -->
    </main>

    <!-- Cart Modal -->
    <div id="cart-modal" class="modal-backdrop" style="display: none;"></div>

    <!-- Toast Notifications Container -->
    <div id="toast-container" class="toast-wrap"></div>
  `;

  // Attach Navigation Listeners
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCurrentTab();
    });
  });

  document.getElementById('nav-brand').addEventListener('click', () => {
    currentTab = 'restaurants';
    document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-tab="restaurants"]').classList.add('active');
    renderCurrentTab();
  });

  document.getElementById('cart-btn').addEventListener('click', toggleCartModal);

  renderCurrentTab();
}

function renderCurrentTab() {
  const container = document.getElementById('main-view');
  if (canvasAnimId) {
    cancelAnimationFrame(canvasAnimId);
    canvasAnimId = null;
  }

  if (currentTab === 'restaurants') {
    renderRestaurantsView(container);
  } else if (currentTab === 'tracking') {
    renderTrackingView(container);
  }
}

// 1. RESTAURANTS VIEW (Bento Hero + Menu Grid)
function renderRestaurantsView(container) {
  container.innerHTML = `
    <!-- Bento Hero Section -->
    <section class="bento-hero">
      <div class="bento-card bento-hero-main">
        <div>
          <div class="bento-tag">● Summer Edition 2026</div>
          <h1 class="bento-hero-title">Culinary Craft, <em>Delivered</em> In Real-Time.</h1>
          <p class="bento-hero-desc">Experience handcrafted dining from the city's finest kitchens with live GPS courier tracking directly to your doorstep.</p>
        </div>
        <div class="bento-hero-actions">
          <button class="btn-bento-primary" onclick="document.getElementById('catalog').scrollIntoView({behavior: 'smooth'})">
            Explore Menus ↓
          </button>
        </div>
      </div>

      <div class="bento-card bento-stat-box">
        <div class="stat-number">24<span style="color: var(--accent); font-size: 2rem;">min</span></div>
        <div class="stat-label">Average Delivery Time</div>
      </div>

      <div class="bento-card bento-stat-box">
        <div class="stat-number">4.9<span style="color: #f59e0b; font-size: 2rem;">★</span></div>
        <div class="stat-label">Customer Satisfaction</div>
      </div>

      <div class="bento-card bento-gps-preview">
        <div>
          <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.25rem;">
            <span class="gps-live-dot"></span> Real-Time GPS Tracking
          </div>
          <div style="color: var(--text-muted); font-size: 0.88rem;">Live courier telemetry stream active for all orders</div>
        </div>
        <button class="pill-filter" onclick="window.goToTracking()">
          View Tracker →
        </button>
      </div>
    </section>

    <!-- Catalog Section Header -->
    <div class="section-header-bar" id="catalog">
      <h2 class="section-title">Selected Kitchens</h2>

      <div class="filter-bar">
        <input type="text" id="search-input" class="search-field" placeholder="Search dishes & cuisine..." value="${searchQuery}" />
        
        <div style="display: flex; gap: 0.4rem;">
          ${['All', 'American', 'Italian', 'Japanese', 'Healthy'].map(cat => `
            <button class="pill-filter ${activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Restaurants Bento Grid -->
    <div id="restaurants-grid" class="restaurants-bento-grid"></div>
  `;

  // Search input handler
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    filterRestaurants();
  });

  // Category filters
  document.querySelectorAll('.pill-filter[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill-filter[data-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-cat');
      filterRestaurants();
    });
  });

  renderRestaurantsGrid();
}

function filterRestaurants() {
  filteredRestaurants = restaurants.filter(r => {
    const matchesCat = activeCategory === 'All' || r.cuisine.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesQuery = !searchQuery || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.menu.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });
  renderRestaurantsGrid();
}

function renderRestaurantsGrid() {
  const grid = document.getElementById('restaurants-grid');
  if (!grid) return;

  if (filteredRestaurants.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">No restaurants found matching your criteria.</div>`;
    return;
  }

  grid.innerHTML = filteredRestaurants.map(r => `
    <div class="restaurant-bento">
      <div class="restaurant-img-wrap">
        <img src="${r.image}" alt="${r.name}" loading="lazy" />
        <div class="rating-badge">★ ${r.rating}</div>
        <div class="time-fee-badge">${r.deliveryTime} • ${r.deliveryFee} fee</div>
      </div>

      <div class="restaurant-body">
        <div class="restaurant-name">${r.name}</div>
        <div class="restaurant-cuisine">${r.cuisine}</div>

        <div class="menu-list-compact">
          ${r.menu.map(item => `
            <div class="menu-item-card">
              <div class="item-left">
                <div class="item-title">${item.name}</div>
                <div class="item-price">₹${item.price.toFixed(2)}</div>
              </div>
              <button class="btn-add" onclick="window.addToCart('${r.id}', '${item.id}')">
                + Add
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// 2. LIVE DELIVERY TRACKER VIEW
function renderTrackingView(container) {
  if (!activeOrder) {
    container.innerHTML = `
      <div class="bento-card" style="padding: 5rem 2rem; text-align: center; max-width: 600px; margin: 2rem auto;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🛵</div>
        <h2 style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.5rem;">No Active Delivery</h2>
        <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 0.95rem;">
          Place an order from any kitchen to start the live real-time GPS courier tracking simulation.
        </p>
        <button class="btn-bento-primary" style="max-width: 220px; margin: 0 auto;" onclick="window.goToRestaurants()">
          Order Food Now →
        </button>
      </div>
    `;
    return;
  }

  const tracker = activeTracking || {
    status: 'PREPARING',
    driverName: 'Alex Rivera',
    driverPhone: '+1 (555) 019-2834',
    vehicle: 'Electric Scooter (FD-882)',
    progress: 10
  };

  container.innerHTML = `
    <div class="tracker-bento-layout">
      <!-- Live Map Bento -->
      <div class="map-bento-box">
        <div class="map-top-bar">
          <div>
            <div style="font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em;">Live GPS Dispatch Radar</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">Tracking Order #${activeOrder.id} • ${activeOrder.restaurantName}</div>
          </div>
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--accent-green); display: flex; align-items: center; gap: 0.35rem;">
            <span class="gps-live-dot"></span> Live Telemetry Active
          </div>
        </div>

        <div class="canvas-frame">
          <canvas id="tracking-canvas" width="600" height="420"></canvas>
        </div>
      </div>

      <!-- Order Status Stepper Sidebar -->
      <div class="tracker-sidebar-bento">
        <div class="stepper-card">
          <div class="status-pill-big ${tracker.status}" id="status-pill">
            ${tracker.status === 'PREPARING' ? '🍳 Kitchen Preparing' :
              tracker.status === 'PICKED_UP' ? '📦 Order Picked Up' :
              tracker.status === 'ON_THE_WAY' ? '🛵 Courier En Route' : '✓ Delivered'}
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 800;">
            <span>Delivery Progress</span>
            <span id="tracker-pct">${tracker.progress || 10}%</span>
          </div>

          <div class="swiss-progress-track">
            <div class="swiss-progress-bar" id="progress-bar" style="width: ${tracker.progress || 10}%;"></div>
          </div>

          <div class="swiss-steps">
            <div class="swiss-step-row ${tracker.progress >= 5 ? 'done' : 'active'}">
              <div class="step-num">1</div>
              <div>Order Confirmed by Restaurant</div>
            </div>
            <div class="swiss-step-row ${tracker.progress >= 25 ? 'done' : tracker.progress >= 5 ? 'active' : ''}">
              <div class="step-num">2</div>
              <div>Fresh Dishes Prepared in Kitchen</div>
            </div>
            <div class="swiss-step-row ${tracker.progress >= 95 ? 'done' : tracker.progress >= 25 ? 'active' : ''}">
              <div class="step-num">3</div>
              <div>Courier On The Way (Live GPS)</div>
            </div>
            <div class="swiss-step-row ${tracker.progress >= 100 ? 'done' : tracker.progress >= 95 ? 'active' : ''}">
              <div class="step-num">4</div>
              <div>Delivered at Destination</div>
            </div>
          </div>

          <div class="driver-box-minimal">
            <div>
              <div class="driver-name">${tracker.driverName}</div>
              <div class="driver-sub">${tracker.vehicle}</div>
            </div>
            <button class="btn-add" style="padding: 0.5rem 1rem;" onclick="alert('Calling Driver: ${tracker.driverPhone}')">
              📞 Call Driver
            </button>
          </div>
        </div>

        <div class="stepper-card">
          <div style="font-weight: 800; margin-bottom: 0.75rem; font-size: 0.95rem;">Order Receipt</div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
            ${activeOrder.items.map(i => `
              <div style="display: flex; justify-content: space-between;">
                <span>${i.quantity}x ${i.name}</span>
                <span style="font-weight: 700;">₹${i.itemTotal.toFixed(2)}</span>
              </div>
            `).join('')}
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-light); padding-top: 0.6rem; font-weight: 900; font-size: 1rem;">
              <span>Total Paid</span>
              <span style="color: var(--accent);">₹${activeOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  initCanvasMap();
}

function handleTrackingUpdate(data) {
  activeTracking = data;
  if (currentTab === 'tracking') {
    const pill = document.getElementById('status-pill');
    const bar = document.getElementById('progress-bar');
    const pct = document.getElementById('tracker-pct');
    if (pill && bar && pct) {
      pill.className = `status-pill-big ${data.status}`;
      pill.textContent = data.status === 'PREPARING' ? '🍳 Kitchen Preparing' :
        data.status === 'PICKED_UP' ? '📦 Order Picked Up' :
        data.status === 'ON_THE_WAY' ? '🛵 Courier En Route' : '✓ Delivered';
      bar.style.width = `${data.progress}%`;
      pct.textContent = `${data.progress}%`;
    }
  }
}

// Canvas Map Animation
function initCanvasMap() {
  const canvas = document.getElementById('tracking-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let pulse = 0;

  function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Minimalist Swiss Architectural Grid
    ctx.strokeStyle = '#1e2025';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Street Road Corridor
    ctx.strokeStyle = '#272930';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(MAP_CONFIG.restX, MAP_CONFIG.restY);
    ctx.lineTo(260, MAP_CONFIG.restY);
    ctx.lineTo(260, 200);
    ctx.lineTo(420, 200);
    ctx.lineTo(420, MAP_CONFIG.custY);
    ctx.lineTo(MAP_CONFIG.custX, MAP_CONFIG.custY);
    ctx.stroke();

    const progress = activeTracking ? activeTracking.progress / 100 : 0.1;

    const waypoints = [
      { x: MAP_CONFIG.restX, y: MAP_CONFIG.restY },
      { x: 260, y: MAP_CONFIG.restY },
      { x: 260, y: 200 },
      { x: 420, y: 200 },
      { x: 420, y: MAP_CONFIG.custY },
      { x: MAP_CONFIG.custX, y: MAP_CONFIG.custY }
    ];

    const segCount = waypoints.length - 1;
    const currentSeg = Math.min(Math.floor(progress * segCount), segCount - 1);
    const segT = (progress * segCount) - currentSeg;
    const p1 = waypoints[currentSeg];
    const p2 = waypoints[currentSeg + 1];

    const driverX = p1.x + (p2.x - p1.x) * segT;
    const driverY = p1.y + (p2.y - p1.y) * segT;

    // Active Journey Line (Swiss Vermillion)
    ctx.strokeStyle = '#ff3322';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(MAP_CONFIG.restX, MAP_CONFIG.restY);
    for (let i = 0; i <= currentSeg; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.lineTo(driverX, driverY);
    ctx.stroke();

    // 1. Restaurant Pin
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(MAP_CONFIG.restX, MAP_CONFIG.restY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#09090b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍳', MAP_CONFIG.restX, MAP_CONFIG.restY + 4);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '600 11px Plus Jakarta Sans';
    ctx.fillText('Kitchen', MAP_CONFIG.restX, MAP_CONFIG.restY + 28);

    // 2. Customer Destination Pin
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(MAP_CONFIG.custX, MAP_CONFIG.custY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🏠', MAP_CONFIG.custX, MAP_CONFIG.custY + 4);
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('Your Address', MAP_CONFIG.custX, MAP_CONFIG.custY + 28);

    // 3. Driver Animated Marker
    pulse += 0.05;
    const pulseRadius = 18 + Math.sin(pulse) * 6;
    ctx.strokeStyle = 'rgba(255, 51, 34, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(driverX, driverY, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ff3322';
    ctx.beginPath();
    ctx.arc(driverX, driverY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText('🛵', driverX, driverY + 5);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Plus Jakarta Sans';
    ctx.fillText('Driver', driverX, driverY - 24);

    canvasAnimId = requestAnimationFrame(renderFrame);
  }

  renderFrame();
}

// CART & CHECKOUT LOGIC
window.addToCart = function(restaurantId, itemId) {
  const rest = restaurants.find(r => r.id === restaurantId);
  if (!rest) return;
  const item = rest.menu.find(m => m.id === itemId);
  if (!item) return;

  const existing = cart.find(c => c.itemId === itemId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      restaurantId,
      restaurantName: rest.name,
      itemId,
      name: item.name,
      price: item.price,
      quantity: 1
    });
  }

  updateCartBadge();
  showToast(`Added "${item.name}" to cart`);
};

window.removeFromCart = function(itemId) {
  cart = cart.filter(c => c.itemId !== itemId);
  updateCartBadge();
  renderCartModal();
};

window.changeCartQty = function(itemId, delta) {
  const item = cart.find(c => c.itemId === itemId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(c => c.itemId !== itemId);
    }
  }
  updateCartBadge();
  renderCartModal();
};

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalQty;
  }
}

function toggleCartModal() {
  isCartOpen = !isCartOpen;
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.style.display = isCartOpen ? 'flex' : 'none';
    if (isCartOpen) {
      renderCartModal();
    }
  }
}

function renderCartModal() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 40 : 0;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + deliveryFee + tax).toFixed(2);

  modal.innerHTML = `
    <div class="receipt-modal">
      <div class="receipt-header">
        <div class="receipt-title">Your Order Receipt</div>
        <button class="close-btn" onclick="window.toggleCartModal()">✕</button>
      </div>

      ${cart.length === 0 ? `
        <div style="text-align: center; padding: 3rem 0; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛍️</div>
          <p>Your cart is empty.</p>
        </div>
      ` : `
        <div class="receipt-items">
          ${cart.map(i => `
            <div class="receipt-row">
              <div>
                <div style="font-weight: 700; font-size: 0.95rem;">${i.name}</div>
                <div style="font-size: 0.82rem; color: var(--text-muted);">₹${i.price.toFixed(2)} each</div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <button class="qty-control-btn" onclick="window.changeCartQty('${i.itemId}', -1)">-</button>
                <span style="font-weight: 800; min-width: 16px; text-align: center;">${i.quantity}</span>
                <button class="qty-control-btn" onclick="window.changeCartQty('${i.itemId}', 1)">+</button>
                <button style="background: transparent; border: none; color: #ef4444; cursor: pointer; margin-left: 0.25rem;" onclick="window.removeFromCart('${i.itemId}')">✕</button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="receipt-summary">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Delivery Fee</span>
            <span>₹${deliveryFee.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Estimated Tax (5% GST)</span>
            <span>₹${tax.toFixed(2)}</span>
          </div>
          <div class="summary-total">
            <span>Total</span>
            <span style="color: var(--accent);">₹${total.toFixed(2)}</span>
          </div>
        </div>

        <button class="btn-checkout-swiss" id="checkout-btn" onclick="window.placeOrder()">
          Place Order & Launch Tracker →
        </button>
      `}
    </div>
  `;
}

window.placeOrder = async function() {
  if (cart.length === 0) return;

  const btn = document.getElementById('checkout-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Processing Order...';
  }

  try {
    const restaurantId = cart[0].restaurantId;
    const payload = {
      restaurantId,
      customerName: 'Alex Customer',
      customerAddress: '42 Market Street, San Francisco, CA',
      items: cart.map(c => ({
        id: c.itemId,
        name: c.name,
        price: c.price,
        quantity: c.quantity
      }))
    };

    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      activeOrder = data.data.order;
      activeTracking = data.data.tracking;
      cart = [];
      updateCartBadge();
      toggleCartModal();
      showToast('Order confirmed! Tracking live GPS.');

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'SUBSCRIBE_ORDER', orderId: activeOrder.id }));
      }

      currentTab = 'tracking';
      document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-tab="tracking"]').classList.add('active');
      renderCurrentTab();
    } else {
      alert('Failed to place order: ' + data.error);
    }
  } catch (err) {
    console.error('Error placing order:', err);
    alert('Error connecting to backend server.');
  }
};

window.toggleCartModal = toggleCartModal;
window.goToRestaurants = () => {
  currentTab = 'restaurants';
  document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-tab="restaurants"]').classList.add('active');
  renderCurrentTab();
};
window.goToTracking = () => {
  currentTab = 'tracking';
  document.querySelectorAll('.nav-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-tab="tracking"]').classList.add('active');
  renderCurrentTab();
};

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'swiss-toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Start
init();
