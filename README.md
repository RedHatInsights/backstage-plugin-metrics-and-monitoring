# Metrics and Monitoring plugin

This is a development mono-repo for the Metrics and Monitoring plugin. This mono-repo was created using @backstage/create-app to provide a backend and frontend for the plugin to integrate with.

You can find the plugin code in plugins/metrics-and-monitoring

## Cards

- Grafana: directs you to your dashboard with the selected env prometheus datasource

- Prometheus: links to the currently selected environments prometheus' alert page

- Catchpoint: Catchpoint tests are used to monitor app availability and directly changes satuspage. The test itself should be set up by the app team

## Setup 

In app-config.yaml first add the proxy:
```yaml
proxy:
  endpoints:
    '/prometheus/stage':
      target: https://prometheus.crcs02ue1.devshift.net
      secure: true
      headers:
        Authorization: "Bearer ${PROMETHEUS_TOKEN}"
    '/prometheus/prod':
      target: https://prometheus.crcp01ue1.devshift.net
      secure: true
      headers:
        Authorization: "Bearer ${PROMETHEUS_TOKEN}"
```

Also in app-config.yaml add redhatinsights.backstage-plugin-metrics-and-monitoring and the card component configs into the dynamic plugins section.

```yaml
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

## Development

To start the app, run:
```sh
yarn install
yarn dev
```
Before you do, you'll likely want to have catalog entries to see the plugin working on. Check out AppStage for that.
Build the Dynamic Plugin

Run ./build - the packed tarball for the release along with its integrity sha will be generated.
