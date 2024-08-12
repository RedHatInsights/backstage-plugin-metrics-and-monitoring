import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { metricsandmonitoringPlugin, MetricsandMonitoringContent } from '../src/plugin';

createDevApp()
  .registerPlugin(metricsandmonitoringPlugin)
  .addPage({
    element: <MetricsandMonitoringContent />,
    title: 'Root Page',
    path: '/metrics-and-monitoring',
  })
  .render();
