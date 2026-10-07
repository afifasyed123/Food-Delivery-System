# 🍔 Food Delivery System (Cloud-Native DevOps Platform)

A full-stack Food Delivery Platform with real-time GPS courier tracking via WebSockets, containerized with Docker & Docker Compose, automated through Jenkins / GitHub Actions CI/CD pipelines with Jira Smart Commits, and monitored using Prometheus & Grafana.

---

## 🌟 Key Features

- **Interactive Frontend**: Modern Single Page App with restaurant menus, interactive cart, checkout, and live GPS map canvas tracking.
- **Microservices API**: Node.js & Express REST API with automated order dispatching.
- **Real-Time GPS Tracking (`FDA-4`)**: WebSocket server (`/ws/tracking`) broadcasting live courier coordinates and delivery status progression (`PREPARING` ➔ `PICKED_UP` ➔ `ON_THE_WAY` ➔ `DELIVERED`).
- **Observability Stack (`FDA-5`)**: Full Prometheus telemetry integration (`/metrics`) exposing latency histograms, request counters, active WebSocket connections, and pre-provisioned Grafana dashboards.
- **CI/CD Pipeline**: Multi-stage Jenkins pipeline (`Jenkinsfile`) and GitHub Actions workflow (`.github/workflows/ci-cd.yml`).
- **Jira Integration**: Native Jira Smart Commit tracking (`FDA-<issue-number>`).
- **Containerization**: Multi-stage production `Dockerfile`s and orchestration with `docker-compose.yml`.

---

## 🏗️ Architecture & Services

```
┌─────────────────────────────────────────────────────────────┐
│                    Web Browser Client                       │
│    - Menu Browsing & Cart                                   │
│    - Real-Time HTML5 GPS Canvas Delivery Map (Port 3000)     │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP & WebSockets
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Service (Node.js/Express)              │
│    - REST Endpoints (/api/restaurants, /api/orders)         │
│    - WebSocket GPS Dispatch Stream (/ws/tracking)           │
│    - Prometheus Metrics Exporter (/metrics) (Port 5000)     │
└───────────────────────────┬─────────────────────────────────┘
                            │ Scrapes /metrics every 5s
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐
│   Prometheus Server    │      │   Grafana Dashboard    │
│   Time-series Database │◄─────┤   Live Visualization   │
│      (Port 9090)       │      │      (Port 3001)       │
└────────────────────────┘      └────────────────────────┘
```

---

## 🚀 Quick Start (Docker Compose)

Run the complete multi-service stack with a single command:

```bash
docker compose up --build -d
```

### 🌐 Service Endpoints

| Service | URL | Purpose |
|---|---|---|
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | Main UI & GPS tracking |
| **Backend REST API** | [http://localhost:5000](http://localhost:5000) | Core API endpoints |
| **Health Check** | [http://localhost:5000/health](http://localhost:5000/health) | Container health probe |
| **Prometheus Metrics** | [http://localhost:5000/metrics](http://localhost:5000/metrics) | Scrape endpoint |
| **Prometheus UI** | [http://localhost:9091](http://localhost:9091) | PromQL queries |
| **Grafana UI** | [http://localhost:3001](http://localhost:3001) | Dashboards (`admin`/`admin`) |

---

## 🧪 Running Locally (Without Docker)

### 1. Backend:
```bash
cd backend
npm install
npm test
npm start
```

### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 CI/CD & Jira Integration

### Jira Smart Commits (`FDA` Project):
```bash
# Link commit to Jira issue
git commit -m "FDA-4 Add WebSocket GPS tracker"

# Mark Jira issue as Done
git commit -m "FDA-4 Implement real-time GPS tracking stream #done"
```

### Jenkins Pipeline:
Includes stages for:
1. Git Checkout & Jira Issue Scan
2. Backend Unit & Integration Tests (Jest)
3. Frontend Build & Static Analysis
4. Docker Multi-Stage Image Builds
5. Health & Prometheus `/metrics` Verification Probe

---

## 📚 Further Documentation
See [`DEVOPS.md`](file:///c:/Users/AFIFA%20SYED/Food-Delivery-System/DEVOPS.md) for detailed DevOps architecture and operations.
