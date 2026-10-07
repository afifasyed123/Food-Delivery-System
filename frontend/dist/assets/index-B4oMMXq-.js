(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function s(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(a){if(a.ep)return;a.ep=!0;const i=s(a);fetch(a.href,i)}})();const T=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"http://localhost:5000":window.location.origin,R=window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"?"ws://localhost:5000/ws/tracking":`ws://${window.location.host}/ws/tracking`;let c="restaurants",S=[],P=[],C="All",p="",o=[],m=null,b=null,v=null,x=!1,k=null;const n={restX:90,restY:300,custX:510,custY:80};async function B(){N(),await F(),_(),H()}function _(){try{v=new WebSocket(R),v.onopen=()=>{console.log("✅ Connected to Food Delivery GPS WebSocket"),E(!0),m&&v.send(JSON.stringify({type:"SUBSCRIBE_ORDER",orderId:m.id}))},v.onmessage=t=>{try{const e=JSON.parse(t.data);e.type==="LOCATION_UPDATE"&&j(e.data)}catch(e){console.error("Error parsing WS message:",e)}},v.onclose=()=>{console.log("⚠️ WebSocket disconnected. Reconnecting in 3s..."),E(!1),setTimeout(_,3e3)},v.onerror=t=>{console.error("WebSocket Error:",t),E(!1)}}catch(t){console.error("WebSocket init error:",t)}}function E(t){const e=document.getElementById("system-status");e&&(e.innerHTML=`
      <span class="pulse-dot" style="background: ${t?"#10b981":"#ef4444"}"></span>
      <span>${t?"System Live & Connected":"Connecting to Gateway..."}</span>
    `)}async function F(){try{const e=await(await fetch(`${T}/api/restaurants`)).json();e.success&&(S=e.data,P=[...S],I())}catch(t){console.error("Failed to load restaurants:",t),D("Backend starting up... using local data cache.")}}function N(){const t=document.getElementById("app");t.innerHTML=`
    <div class="app-layout">
      <nav class="navbar">
        <div class="brand-container" id="nav-brand">
          <div class="brand-logo-icon">🍔</div>
          <div>
            <div class="brand-title">QuickBite Cloud</div>
            <div style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">CI/CD • Docker • Prometheus</div>
          </div>
        </div>

        <div class="nav-links">
          <button class="nav-btn ${c==="restaurants"?"active":""}" data-tab="restaurants">
            <span>🍽️</span> Restaurants
          </button>
          <button class="nav-btn ${c==="tracking"?"active":""}" data-tab="tracking">
            <span>🛰️</span> Live GPS Tracker
          </button>
          <button class="nav-btn ${c==="devops"?"active":""}" data-tab="devops">
            <span>📊</span> DevOps & Metrics
          </button>
          <button class="nav-btn ${c==="cicd"?"active":""}" data-tab="cicd">
            <span>⚙️</span> CI/CD & Jira Pipeline
          </button>
        </div>

        <div class="nav-actions">
          <div id="system-status" class="system-status-chip">
            <span class="pulse-dot"></span>
            <span>Connecting...</span>
          </div>

          <button class="cart-button" id="cart-btn">
            <span>🛒</span>
            <span>Cart</span>
            <span class="cart-badge" id="cart-count">0</span>
          </button>
        </div>
      </nav>

      <main class="main-content" id="main-view">
        <!-- Tab Content dynamically injected here -->
      </main>

      <!-- Cart Drawer / Modal -->
      <div id="cart-modal" class="modal-overlay" style="display: none;"></div>

      <!-- Toast Container -->
      <div id="toast-container" class="toast-container"></div>
    </div>
  `,document.querySelectorAll(".nav-btn").forEach(e=>{e.addEventListener("click",()=>{c=e.getAttribute("data-tab"),document.querySelectorAll(".nav-btn").forEach(s=>s.classList.remove("active")),e.classList.add("active"),y()})}),document.getElementById("nav-brand").addEventListener("click",()=>{c="restaurants",document.querySelectorAll(".nav-btn").forEach(e=>e.classList.remove("active")),document.querySelector('[data-tab="restaurants"]').classList.add("active"),y()}),document.getElementById("cart-btn").addEventListener("click",A),y()}function y(){const t=document.getElementById("main-view");k&&(cancelAnimationFrame(k),k=null),c==="restaurants"?W(t):c==="tracking"?G(t):c==="devops"?X(t):c==="cicd"&&V(t)}function W(t){t.innerHTML=`
    <div class="hero-banner">
      <div class="hero-text">
        <h1>Fresh Food Delivered with <span>Real-Time GPS Tracking</span></h1>
        <p>Order from the best culinary spots in town. Experience real-time order progression powered by Node.js WebSockets, Docker, and Prometheus telemetry.</p>
        <div class="hero-badges">
          <span class="tech-badge">⚡ Real-time WebSockets</span>
          <span class="tech-badge">🐳 Docker Compose</span>
          <span class="tech-badge">📈 Prometheus & Grafana</span>
          <span class="tech-badge">🐙 Jira & Jenkins CI/CD</span>
        </div>
      </div>
    </div>

    <div class="search-filter-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input" class="search-input" placeholder="Search dishes, burgers, pizza, sushi..." value="${p}" />
      </div>
      <div class="cuisine-pills">
        ${["All","American","Italian","Japanese","Healthy"].map(s=>`
          <button class="pill-btn ${C===s?"active":""}" data-cat="${s}">${s}</button>
        `).join("")}
      </div>
    </div>

    <div id="restaurants-grid" class="restaurant-grid"></div>
  `,document.getElementById("search-input").addEventListener("input",s=>{p=s.target.value,M()}),document.querySelectorAll(".pill-btn").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".pill-btn").forEach(r=>r.classList.remove("active")),s.classList.add("active"),C=s.getAttribute("data-cat"),M()})}),I()}function M(){P=S.filter(t=>{const e=C==="All"||t.cuisine.toLowerCase().includes(C.toLowerCase()),s=!p||t.name.toLowerCase().includes(p.toLowerCase())||t.cuisine.toLowerCase().includes(p.toLowerCase())||t.menu.some(r=>r.name.toLowerCase().includes(p.toLowerCase()));return e&&s}),I()}function I(){const t=document.getElementById("restaurants-grid");if(t){if(P.length===0){t.innerHTML='<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">No restaurants found matching your criteria.</div>';return}t.innerHTML=P.map(e=>`
    <div class="restaurant-card">
      <div class="card-image-wrap">
        <img src="${e.image}" alt="${e.name}" loading="lazy" />
        <div class="card-rating-badge">★ ${e.rating}</div>
      </div>
      <div class="card-content">
        <div class="card-title">${e.name}</div>
        <div class="card-cuisine">${e.cuisine}</div>
        <div class="card-meta">
          <span class="meta-item">⏱️ ${e.deliveryTime}</span>
          <span class="meta-item">🛵 Delivery: ${e.deliveryFee}</span>
        </div>

        <div class="menu-section-title">Popular Items</div>
        <div class="menu-list">
          ${e.menu.map(s=>`
            <div class="menu-item-row">
              <div class="menu-item-info">
                <div class="menu-item-name">${s.name}</div>
                <div class="menu-item-price">$${s.price.toFixed(2)}</div>
              </div>
              <button class="btn-add-item" onclick="window.addToCart('${e.id}', '${s.id}')">
                + Add
              </button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `).join("")}}function G(t){if(!m){t.innerHTML=`
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 4rem 2rem; text-align: center;">
        <div style="font-size: 3.5rem; margin-bottom: 1rem;">🛰️</div>
        <h2>No Active Order Tracking</h2>
        <p style="color: var(--text-muted); margin: 0.75rem auto 1.5rem; max-width: 450px;">
          Place an order from any restaurant to trigger the live GPS WebSocket stream, driver simulation, and Prometheus metrics telemetry.
        </p>
        <button class="btn-primary" style="max-width: 250px; margin: 0 auto;" onclick="window.goToRestaurants()">
          Browse Menu & Order
        </button>
      </div>
    `;return}const e=b||{status:"PREPARING",driverName:"Alex Rivera",driverPhone:"+1 (555) 019-2834",vehicle:"Electric Scooter (Plate: FD-882)",progress:10};t.innerHTML=`
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
      <div>
        <h2 style="font-size: 1.8rem; font-weight: 800;">Live GPS Delivery Stream</h2>
        <p style="color: var(--text-muted);">Tracking Order <strong>#${m.id}</strong> from ${m.restaurantName}</p>
      </div>
      <div class="tech-badge" style="background: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.3); color: var(--accent-cyan);">
        📡 WebSocket Stream Active
      </div>
    </div>

    <div class="tracking-container">
      <div class="map-card">
        <div class="map-header">
          <div style="font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
            🗺️ Live Dispatch GPS Canvas
          </div>
          <div style="font-size: 0.85rem; color: var(--accent-green);">● Driver Connected</div>
        </div>
        <div class="map-canvas-container">
          <canvas id="tracking-canvas" width="600" height="380"></canvas>
        </div>
      </div>

      <div class="tracking-sidebar">
        <div class="status-card">
          <div class="status-badge-lg ${e.status}" id="tracker-status-badge">
            ${e.status==="PREPARING"?"🍳 Kitchen Preparing":e.status==="PICKED_UP"?"📦 Picked Up by Driver":e.status==="ON_THE_WAY"?"🛵 Driver On The Way":"🎉 Delivered!"}
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700;">
            <span>Estimated Delivery Progress</span>
            <span id="tracker-progress-text">${e.progress||0}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" id="tracker-progress-bar" style="width: ${e.progress||10}%;"></div>
          </div>

          <div class="timeline-steps">
            <div class="timeline-step ${e.progress>=5?"done":"active"}">
              <div class="step-icon">1</div>
              <div>Order Placed & Confirmed</div>
            </div>
            <div class="timeline-step ${e.progress>=25?"done":e.progress>=5?"active":""}">
              <div class="step-icon">2</div>
              <div>Restaurant Preparing Meal</div>
            </div>
            <div class="timeline-step ${e.progress>=95?"done":e.progress>=30?"active":""}">
              <div class="step-icon">3</div>
              <div>Courier En Route with GPS Tracking</div>
            </div>
            <div class="timeline-step ${e.progress>=100?"done":e.progress>=95?"active":""}">
              <div class="step-icon">4</div>
              <div>Order Delivered at Destination</div>
            </div>
          </div>

          <div class="driver-card">
            <div class="driver-info">
              <div class="driver-avatar">🛵</div>
              <div>
                <div style="font-weight: 700; font-size: 0.95rem;">${e.driverName}</div>
                <div style="font-size: 0.8rem; color: var(--text-dim);">${e.vehicle}</div>
              </div>
            </div>
            <button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; width: auto;" onclick="alert('Calling Driver: ${e.driverPhone}')">
              📞 Call
            </button>
          </div>
        </div>

        <div class="status-card">
          <div style="font-weight: 700; margin-bottom: 0.75rem;">Order Summary</div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
            ${m.items.map(s=>`
              <div style="display: flex; justify-content: space-between;">
                <span>${s.quantity}x ${s.name}</span>
                <span style="font-weight: 600;">$${s.itemTotal.toFixed(2)}</span>
              </div>
            `).join("")}
            <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 0.5rem; font-weight: 700; color: var(--accent-green);">
              <span>Total Paid</span>
              <span>$${m.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,Y()}function j(t){if(b=t,c==="tracking"){const e=document.getElementById("tracker-status-badge"),s=document.getElementById("tracker-progress-bar"),r=document.getElementById("tracker-progress-text");e&&s&&r&&(e.className=`status-badge-lg ${t.status}`,e.textContent=t.status==="PREPARING"?"🍳 Kitchen Preparing":t.status==="PICKED_UP"?"📦 Picked Up by Driver":t.status==="ON_THE_WAY"?"🛵 Driver On The Way":"🎉 Delivered!",s.style.width=`${t.progress}%`,r.textContent=`${t.progress}%`)}}function Y(){const t=document.getElementById("tracking-canvas");if(!t)return;const e=t.getContext("2d");let s=0;function r(){e.clearRect(0,0,t.width,t.height),e.strokeStyle="rgba(255, 255, 255, 0.04)",e.lineWidth=1;for(let d=0;d<t.width;d+=40)e.beginPath(),e.moveTo(d,0),e.lineTo(d,t.height),e.stroke();for(let d=0;d<t.height;d+=40)e.beginPath(),e.moveTo(0,d),e.lineTo(t.width,d),e.stroke();e.strokeStyle="rgba(255, 255, 255, 0.12)",e.lineWidth=10,e.lineCap="round",e.beginPath(),e.moveTo(n.restX,n.restY),e.lineTo(250,n.restY),e.lineTo(250,180),e.lineTo(400,180),e.lineTo(400,n.custY),e.lineTo(n.custX,n.custY),e.stroke();const a=b?b.progress/100:.1,i=[{x:n.restX,y:n.restY},{x:250,y:n.restY},{x:250,y:180},{x:400,y:180},{x:400,y:n.custY},{x:n.custX,y:n.custY}],l=i.length-1,h=Math.min(Math.floor(a*l),l-1),O=a*l-h,w=i[h],z=i[h+1],g=w.x+(z.x-w.x)*O,f=w.y+(z.y-w.y)*O;e.strokeStyle="#ff5a36",e.lineWidth=4,e.beginPath(),e.moveTo(n.restX,n.restY);for(let d=0;d<=h;d++)e.lineTo(i[d].x,i[d].y);e.lineTo(g,f),e.stroke(),e.fillStyle="#ff8c42",e.beginPath(),e.arc(n.restX,n.restY,14,0,Math.PI*2),e.fill(),e.fillStyle="#ffffff",e.font="12px sans-serif",e.textAlign="center",e.fillText("🍳",n.restX,n.restY+4),e.fillStyle="#94a3b8",e.font="10px Plus Jakarta Sans",e.fillText("Restaurant",n.restX,n.restY+28),e.fillStyle="#10b981",e.beginPath(),e.arc(n.custX,n.custY,14,0,Math.PI*2),e.fill(),e.fillStyle="#ffffff",e.fillText("🏠",n.custX,n.custY+4),e.fillStyle="#94a3b8",e.fillText("Delivery Address",n.custX,n.custY+28),s+=.05;const q=16+Math.sin(s)*6;e.strokeStyle="rgba(6, 182, 212, 0.4)",e.lineWidth=2,e.beginPath(),e.arc(g,f,q,0,Math.PI*2),e.stroke(),e.fillStyle="#06b6d4",e.beginPath(),e.arc(g,f,16,0,Math.PI*2),e.fill(),e.fillStyle="#ffffff",e.font="14px sans-serif",e.fillText("🛵",g,f+5),e.fillStyle="#06b6d4",e.font="bold 11px Plus Jakarta Sans",e.fillText("Driver (GPS)",g,f-22),k=requestAnimationFrame(r)}r()}let u={requestsTotal:42,activeWs:1,activeOrders:0};async function H(){setInterval(async()=>{try{const t=await fetch(`${T}/metrics`);if(t.ok){const e=await t.text();J(e),c==="devops"&&U()}}catch{}},3e3)}function J(t){const e=t.match(/food_delivery_http_requests_total\{.*?\}\s+(\d+)/g);if(e){let a=0;e.forEach(i=>{const l=parseInt(i.split(/\s+/).pop());isNaN(l)||(a+=l)}),u.requestsTotal=a}const s=t.match(/food_delivery_active_ws_clients\s+(\d+)/);s&&(u.activeWs=parseInt(s[1]));const r=t.match(/food_delivery_active_orders\s+(\d+)/);r&&(u.activeOrders=parseInt(r[1]))}function X(t){t.innerHTML=`
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.8rem; font-weight: 800;">Prometheus Observability & Metrics</h2>
      <p style="color: var(--text-muted);">Real-time telemetry gathered directly from <code>/metrics</code> scrape target.</p>
    </div>

    <div class="devops-grid">
      <div class="metric-card">
        <div class="metric-card-title">Total HTTP Requests</div>
        <div class="metric-card-value" id="metric-req-total" style="color: var(--accent-cyan);">${u.requestsTotal}</div>
        <div class="metric-card-sub">Scraped from <code>food_delivery_http_requests_total</code></div>
      </div>

      <div class="metric-card">
        <div class="metric-card-title">Active GPS WebSocket Clients</div>
        <div class="metric-card-value" id="metric-ws-clients" style="color: var(--accent-primary);">${u.activeWs}</div>
        <div class="metric-card-sub">Scraped from <code>food_delivery_active_ws_clients</code></div>
      </div>

      <div class="metric-card">
        <div class="metric-card-title">In-Flight Orders</div>
        <div class="metric-card-value" id="metric-active-orders" style="color: var(--accent-green);">${u.activeOrders}</div>
        <div class="metric-card-sub">Scraped from <code>food_delivery_active_orders</code></div>
      </div>

      <div class="metric-card">
        <div class="metric-card-title">Prometheus Endpoint</div>
        <div class="metric-card-value" style="font-size: 1.4rem; color: #facc15;">Port 9090 / 5000</div>
        <div class="metric-card-sub"><a href="${T}/metrics" target="_blank" style="color: var(--accent-cyan); text-decoration: none;">View Raw /metrics ↗</a></div>
      </div>
    </div>

    <div class="pipeline-diagram-card">
      <h3 style="margin-bottom: 0.5rem;">Infrastructure Architecture Stack</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Fully containerized with Docker Compose & configured for automated Jenkins / GitHub Actions CI/CD.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="font-weight: 700; color: var(--accent-primary); margin-bottom: 0.3rem;">🚀 Backend Service</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Node.js • Express • WebSocket Server • prom-client exporter (Port 5000)</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="font-weight: 700; color: var(--accent-cyan); margin-bottom: 0.3rem;">💻 Frontend Web App</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Vite Single Page App • Nginx Container (Port 3000)</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="font-weight: 700; color: #f59e0b; margin-bottom: 0.3rem;">📈 Prometheus Server</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Scrapes <code>backend:5000/metrics</code> every 5 seconds (Port 9090)</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="font-weight: 700; color: var(--accent-green); margin-bottom: 0.3rem;">📊 Grafana Dashboards</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">Auto-provisioned Dashboards & Prometheus Data Source (Port 3001)</div>
        </div>
      </div>
    </div>
  `}function U(){const t=document.getElementById("metric-req-total"),e=document.getElementById("metric-ws-clients"),s=document.getElementById("metric-active-orders");t&&(t.textContent=u.requestsTotal),e&&(e.textContent=u.activeWs),s&&(s.textContent=u.activeOrders)}function V(t){t.innerHTML=`
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.8rem; font-weight: 800;">CI/CD Pipeline & Jira Integration Status</h2>
      <p style="color: var(--text-muted);">Automated build, test, dockerization, and Jira issue synchronization.</p>
    </div>

    <div class="pipeline-diagram-card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3>Jenkins / GitHub Actions Pipeline Execution</h3>
        <div class="tech-badge" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: var(--accent-green);">
          ✓ All Stages Passing
        </div>
      </div>

      <div class="pipeline-stages">
        <div class="pipeline-stage success">
          <div class="stage-title">1. Checkout & Git</div>
          <div class="stage-status">Passed (0.8s)</div>
        </div>
        <div class="pipeline-stage success">
          <div class="stage-title">2. Lint & Audit</div>
          <div class="stage-status">Passed (1.4s)</div>
        </div>
        <div class="pipeline-stage success">
          <div class="stage-title">3. Unit & Integration</div>
          <div class="stage-status">5/5 Passed (0.9s)</div>
        </div>
        <div class="pipeline-stage success">
          <div class="stage-title">4. Docker Build</div>
          <div class="stage-status">Passed (4.2s)</div>
        </div>
        <div class="pipeline-stage success">
          <div class="stage-title">5. Deploy & Verify</div>
          <div class="stage-status">Passed (1.1s)</div>
        </div>
      </div>
    </div>

    <div class="pipeline-diagram-card">
      <h3 style="margin-bottom: 1rem;">Linked Jira Issues & Smart Commits</h3>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span class="tech-badge" style="background: #2563eb; color: #fff; font-size: 0.75rem;">FDA-4</span>
            <strong style="margin-left: 0.5rem;">Build WebSocket service for live GPS location streaming</strong>
            <div style="color: var(--text-dim); font-size: 0.8rem; margin-top: 0.25rem;">Linked commit: <code>a0c95ac</code> • Status: <strong>DONE</strong></div>
          </div>
          <span style="color: var(--accent-green); font-weight: 700; font-size: 0.85rem;">✓ RESOLVED</span>
        </div>

        <div style="padding: 1rem; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span class="tech-badge" style="background: #2563eb; color: #fff; font-size: 0.75rem;">FDA-5</span>
            <strong style="margin-left: 0.5rem;">Prometheus metrics & Grafana dashboard integration</strong>
            <div style="color: var(--text-dim); font-size: 0.8rem; margin-top: 0.25rem;">Endpoints: <code>/metrics</code>, Prometheus exporter, Docker compose</div>
          </div>
          <span style="color: var(--accent-green); font-weight: 700; font-size: 0.85rem;">✓ ACTIVE</span>
        </div>
      </div>
    </div>
  `}window.addToCart=function(t,e){const s=S.find(i=>i.id===t);if(!s)return;const r=s.menu.find(i=>i.id===e);if(!r)return;const a=o.find(i=>i.itemId===e);a?a.quantity++:o.push({restaurantId:t,restaurantName:s.name,itemId:e,name:r.name,price:r.price,quantity:1}),$(),D(`Added "${r.name}" to cart!`)};window.removeFromCart=function(t){o=o.filter(e=>e.itemId!==t),$(),L()};window.changeCartQty=function(t,e){const s=o.find(r=>r.itemId===t);s&&(s.quantity+=e,s.quantity<=0&&(o=o.filter(r=>r.itemId!==t))),$(),L()};function $(){const t=document.getElementById("cart-count");if(t){const e=o.reduce((s,r)=>s+r.quantity,0);t.textContent=e}}function A(){x=!x;const t=document.getElementById("cart-modal");t&&(t.style.display=x?"flex":"none",x&&L())}function L(){const t=document.getElementById("cart-modal");if(!t)return;const e=o.reduce((i,l)=>i+l.price*l.quantity,0),s=o.length>0?2.99:0,r=+(e*.08).toFixed(2),a=+(e+s+r).toFixed(2);t.innerHTML=`
    <div class="modal-card">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800;">Your Cart</h3>
        <button class="modal-close-btn" onclick="window.toggleCartModal()">✕</button>
      </div>

      ${o.length===0?`
        <div style="text-align: center; padding: 2.5rem 0; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛒</div>
          <p>Your cart is empty.</p>
        </div>
      `:`
        <div class="cart-items-list">
          ${o.map(i=>`
            <div class="cart-item-row">
              <div>
                <div style="font-weight: 700; font-size: 0.95rem;">${i.name}</div>
                <div style="font-size: 0.85rem; color: var(--accent-green);">$${i.price.toFixed(2)} each</div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <button class="btn-add-item" style="padding: 0.2rem 0.6rem;" onclick="window.changeCartQty('${i.itemId}', -1)">-</button>
                <span style="font-weight: 700;">${i.quantity}</span>
                <button class="btn-add-item" style="padding: 0.2rem 0.6rem;" onclick="window.changeCartQty('${i.itemId}', 1)">+</button>
                <button style="background: transparent; border: none; color: #ef4444; cursor: pointer;" onclick="window.removeFromCart('${i.itemId}')">🗑️</button>
              </div>
            </div>
          `).join("")}
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.9rem;">
          <div style="display: flex; justify-content: space-between; color: var(--text-muted);">
            <span>Subtotal</span>
            <span>$${e.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: var(--text-muted);">
            <span>Delivery Fee</span>
            <span>$${s.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: var(--text-muted);">
            <span>Estimated Tax (8%)</span>
            <span>$${r.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: #fff; border-top: 1px solid var(--border-color); padding-top: 0.6rem;">
            <span>Total</span>
            <span style="color: var(--accent-green);">$${a.toFixed(2)}</span>
          </div>
        </div>

        <button class="btn-primary" id="checkout-btn" onclick="window.placeOrder()">
          🚀 Place Order & Start Live GPS Tracking
        </button>
      `}
    </div>
  `}window.placeOrder=async function(){if(o.length===0)return;const t=document.getElementById("checkout-btn");t&&(t.disabled=!0,t.textContent="Processing Order...");try{const s={restaurantId:o[0].restaurantId,customerName:"Alex Customer",customerAddress:"42 Market Street, San Francisco, CA",items:o.map(i=>({id:i.itemId,name:i.name,price:i.price,quantity:i.quantity}))},a=await(await fetch(`${T}/api/orders`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})).json();a.success?(m=a.data.order,b=a.data.tracking,o=[],$(),A(),D("🎉 Order placed successfully! Switching to GPS tracker."),v&&v.readyState===WebSocket.OPEN&&v.send(JSON.stringify({type:"SUBSCRIBE_ORDER",orderId:m.id})),c="tracking",document.querySelectorAll(".nav-btn").forEach(i=>i.classList.remove("active")),document.querySelector('[data-tab="tracking"]').classList.add("active"),y()):alert("Failed to place order: "+a.error)}catch(e){console.error("Error placing order:",e),alert("Error connecting to backend server.")}};window.toggleCartModal=A;window.goToRestaurants=()=>{c="restaurants",document.querySelectorAll(".nav-btn").forEach(t=>t.classList.remove("active")),document.querySelector('[data-tab="restaurants"]').classList.add("active"),y()};function D(t){const e=document.getElementById("toast-container");if(!e)return;const s=document.createElement("div");s.className="toast",s.innerHTML=`<span>🔔</span> <span>${t}</span>`,e.appendChild(s),setTimeout(()=>{s.remove()},3500)}B();
