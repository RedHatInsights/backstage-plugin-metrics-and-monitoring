# [Backstage](https://backstage.io)

This is a Backstage mono-repo for developing the **Metrics and Monitoring** plugin.

## Metrics and Monitoring plugin

The plugin lives in `plugins/metrics-and-monitoring` and is sourced from [RedHatInsights/backstage-plugin-metrics-and-monitoring](https://github.com/RedHatInsights/backstage-plugin-metrics-and-monitoring). It provides:

- **Grafana**: link to dashboard with the selected env Prometheus datasource
- **Prometheus**: link to the selected environment's Prometheus alert page
- **Kibana**: link to the selected environment's Kibana instance
- **Catchpoint**: tests for app availability (annotation-driven)
- **Active alerts table**: Prometheus firing alerts for the selected environment

### Start the app

```sh
yarn install
yarn start
```

### Build the plugin for dynamic deployment (janus-cli)

To build the plugin and export it as a dynamic plugin (packaged tarball):

```sh
yarn build:dynamic-plugin
# or run the build script (also prints integrity checksum)
./build
```

Scripts:

- `yarn build:plugin` – build the plugin with Backstage CLI
- `yarn export-dynamic` – run janus-cli `export-dynamic-plugin` (packages for dynamic loading)
- `yarn build:dynamic-plugin` – build then export-dynamic

### Dynamic plugin configuration

For a Red Hat Developer Hub / dynamic plugin deployment, configure `app-config.yaml` with the proxy and dynamic plugin mount:

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

dynamicPlugins:
  frontend:
    redhatinsights.backstage-plugin-metrics-and-monitoring:
      mountPoints:
        - mountPoint: entity.page.monitoring/cards
          importName: MetricsandMonitoringContent
          config:
            layout:
              gridColumnEnd:
                lg: "span 12"
                md: "span 6"
                xs: "span 12"
```
