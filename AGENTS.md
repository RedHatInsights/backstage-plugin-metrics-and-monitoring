# Metrics and Monitoring Plugin

## Project Overview

A Backstage plugin that displays environment-aware monitoring data (Grafana, Prometheus, Kibana,
Catchpoint, active alerts) on catalog entity pages. Built as a dynamic plugin for Red Hat Developer
Hub. Distributed as a packaged tarball.

## Dependencies

- **Runtime:** Node.js 22+, Backstage CLI ^0.35.4, React, TypeScript
- **Build:** janus-cli (dynamic plugin export)
- **Test:** Jest, Playwright (E2E)
- **Lint:** ESLint, Prettier
- **CI:** None configured in GitHub Actions

## Development Commands

```sh
yarn install              # Install dependencies
yarn start                # Start dev server
yarn test                 # Unit tests
yarn test:all             # All tests with coverage
yarn test:e2e             # E2E tests
yarn tsc                  # Type checking
yarn lint                 # Lint changed files
yarn build:dynamic-plugin # Build and export dynamic plugin
```

See the README for RHDH proxy and dynamic plugin configuration.

## Architecture

Backstage monorepo with the plugin in `plugins/metrics-and-monitoring/`. Uses proxy-based
Prometheus access with environment-aware card rendering. See [ARCHITECTURE.md][architecture]
for design decisions.

## Code Style

- **Linter:** ESLint (Backstage preset)
- **Formatter:** Prettier
- **Language:** TypeScript (via `tsconfig.json`)
- **Node.js:** 22+ required

## Common Mistakes

1. **Missing proxy configuration.** The plugin queries Prometheus through Backstage's proxy. Each
   environment needs its own proxy endpoint in `app-config.yaml`. Without it, the alerts table
   shows empty results with no error.

2. **Confusing `build:plugin` with `build:dynamic-plugin`.** The former only builds the plugin;
   the latter also exports it for dynamic loading. Only the dynamic export produces a deployable
   tarball.

3. **Running `yarn lint` expecting full coverage.** Defaults to checking only files changed since
   `origin/main`. Use `yarn lint:all` for the complete codebase.

[architecture]: ./ARCHITECTURE.md
