import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { mnmEntityPlugin, EntityMnmEntityContent } from '../src/plugin';

createDevApp()
  .registerPlugin(mnmEntityPlugin)
  .addPage({
    element: <EntityMnmEntityContent />,
    title: 'Root Page',
    path: '/mnm',
  })
  .render();
