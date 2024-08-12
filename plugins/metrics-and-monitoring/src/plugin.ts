import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

export const metricsandmonitoringPlugin = createPlugin({
  id: 'metrics and monitoring entity',
});

export const MetricsandMonitoringContent = metricsandmonitoringPlugin.provide(
  createComponentExtension({
    name: 'MetricsandMonitoringContent',
    component: {
      lazy: () => import('./components/Metrics-and-MonitoringComponent').then(m => m.MetricsandMonitoringComponent),
    },
  }),
);
