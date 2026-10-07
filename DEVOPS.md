# DevOps Architecture & Operations Guide

This guide details the complete DevOps, CI/CD, Containerization, and Observability stack for the **Food Delivery System**.

---

## 🛠️ Stack Overview

| Component | Technology | Port | Description |
|---|---|---|---|
| **Frontend Web App** | Vite, Vanilla JS, CSS Glassmorphism, Nginx | `3000` | User ordering & Live GPS map tracking interface |
| **Backend API** | Node.js, Express, WebSockets (`ws`) | `5000` | REST API + real-time GPS telemetry stream |
| **Metrics Exporter** | `prom-client` | `5000/metrics` | Prometheus metrics scrape endpoint |
| **Prometheus Server** | Prometheus v2.51.0 | `9091` | Timeseries metric scraper and storage engine |
| **Grafana Dashboard** | Grafana v10.4.0 | `3002` | Pre-provisioned visual dashboard with alerting |
| **CI/CD Automation** | Jenkins (`Jenkinsfile`) & GitHub Actions | - | Automated linting, test execution, container builds |
| **Issue Management** | Jira Smart Commits (`FDA-*`) | - | Commit message tracking and issue status progression |

---

## 🚀 Running with Docker Compose

To start the entire multi-container stack in one command:

```bash
docker compose up --build -d
```

### Access URLs:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/restaurants](http://localhost:5000/api/restaurants)
- **Prometheus Metrics**: [http://localhost:5000/metrics](http://localhost:5000/metrics)
- **Prometheus UI**: [http://localhost:9091](http://localhost:9091)
- **Grafana UI**: [http://localhost:3002](http://localhost:3002) *(Login: `admin` / `admin`)*

To stop all containers:
```bash
docker compose down
```

---

## ⚙️ CI/CD Pipeline (Jenkins & GitHub Actions)

### 1. Jenkins Pipeline (`Jenkinsfile`)
The declarative pipeline includes the following stages:
1. **Git Checkout & Jira Scan**: Validates git commit references against Jira project key `FDA`.
2. **Backend Tests**: Executes Jest test suites in `backend/` with detection for open handles.
3. **Frontend Build**: Compiles Vite assets with production bundle verification.
4. **Docker Container Build**: Runs `docker compose build` for backend and frontend.
5. **Deploy & Health Verification**: Tests `/health` and `/metrics` response.

### 2. GitHub Actions (`.github/workflows/ci-cd.yml`)
Triggers automatically on every `push` and `pull_request` to validate code quality and Docker builds.

---

## 📋 Jira Integration & Smart Commits

To link git commits to your Jira board (Project Key: `FDA`):

- **Reference an issue:**
  ```bash
  git commit -m "FDA-4 Add WebSocket GPS tracker"
  ```
- **Transition an issue to Done:**
  ```bash
  git commit -m "FDA-4 Build WebSocket service for live GPS location streaming #done"
  ```
- **Log time / add comment:**
  ```bash
  git commit -m "FDA-4 Implement Prometheus metric exporter #comment Ready for review #time 1h 30m"
  ```

---

## 📈 Prometheus & Grafana Setup

### Custom Prometheus Metrics Exposed:
- `food_delivery_http_requests_total`: Counter by HTTP method, route, and status code.
- `food_delivery_http_request_duration_seconds`: Histogram measuring API latency buckets.
- `food_delivery_active_ws_clients`: Gauge of connected GPS tracking WebSocket clients.
- `food_delivery_orders_total`: Counter of food orders placed per restaurant.
- `food_delivery_active_orders`: Gauge of active in-flight delivery orders.
- `food_delivery_order_delivery_duration_seconds`: Histogram for completed delivery durations.

Grafana comes auto-provisioned with the Prometheus datasource and the **Food Delivery System - Production Observability** dashboard.
