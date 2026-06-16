# Metrics and Monitoring - Backstage Plugin

A Backstage plugin for displaying environment-aware monitoring data on catalog entity pages.
Provides links to Grafana dashboards, Prometheus alerts, Kibana instances, and Catchpoint
availability tests, along with a live table of firing Prometheus alerts.

## Features

- **Grafana** — link to dashboard with the selected environment's Prometheus datasource
- **Prometheus** — link to the environment's Prometheus alert page
- **Kibana** — link to the environment's Kibana instance
- **Catchpoint** — availability tests (annotation-driven)
- **Active Alerts Table** — Prometheus firing alerts for the selected environment

## Prerequisites

- Node.js 22+ and Yarn
- Prometheus endpoints accessible via Backstage proxy

## Development Setup

```sh
# Install dependencies
yarn install

# Start the dev server
yarn start
```

### Build the Dynamic Plugin

```sh
# Build and export as dynamic plugin
yarn build:dynamic-plugin

# Or use the build script (also prints integrity checksum)
./build
```

Build scripts:

- `yarn build:plugin` — build with Backstage CLI
- `yarn export-dynamic` — run janus-cli `export-dynamic-plugin`
- `yarn build:dynamic-plugin` — build then export

### RHDH Configuration

Configure proxies for each Prometheus environment in `app-config.yaml`:

```yaml
proxy:
  endpoints:
    '/prometheus/stage':
      target: <stage-prometheus-api>
      secure: true
      headers:
        Authorization: "Bearer ${STAGE_PROMETHEUS_TOKEN}"
    '/prometheus/prod':
      target: <prod-prometheus-api>
      secure: true
      headers:
        Authorization: "Bearer ${PROD_PROMETHEUS_TOKEN}"
```

Add the dynamic plugin mount:

```yaml
dynamicPlugins:
  frontend:
    redhatinsights.backstage-plugin-metrics-and-monitoring:
      mountPoints:
        - mountPoint: entity.page.monitoring/cards
          importName: MetricsandMonitoringContent
```

## Testing

```sh
yarn test          # Unit tests
yarn test:all      # All tests with coverage
yarn test:e2e      # E2E tests (Playwright)
yarn tsc           # Type checking
yarn lint          # Lint changed files
yarn lint:all      # Lint all
```

## License

No license file is included in this repository.
