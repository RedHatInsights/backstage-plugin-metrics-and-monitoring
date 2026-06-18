# Architecture

## Overview

A Backstage monorepo containing the Metrics and Monitoring plugin. Provides entity page cards that
display environment-aware monitoring data from Prometheus, Grafana, Kibana, and Catchpoint.

## Module Structure

```text
plugins/
  metrics-and-monitoring/   # The main plugin package
packages/
  app/                      # Backstage app shell for local development
  backend/                  # Backstage backend for local development
build/                      # Build scripts for dynamic plugin packaging
examples/                   # Example catalog entities
playwright.config.ts        # E2E test configuration
```

## Key Design Decisions

- **Environment-aware cards.** The plugin renders monitoring links and alerts for a user-selected
  environment (e.g., stage, prod). Environment selection is driven by the proxy configuration —
  each environment gets its own Prometheus proxy endpoint.
- **Proxy-based data access.** All Prometheus queries go through Backstage's proxy, keeping
  authentication tokens server-side and avoiding CORS issues.
- **Dynamic plugin export.** Uses janus-cli to export the plugin for dynamic loading in RHDH,
  allowing deployment without rebuilding the Backstage instance.
- **Annotation-driven Catchpoint.** Catchpoint availability tests are configured per-entity via
  catalog annotations, allowing different entities to show different tests.
