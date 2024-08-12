import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

export const mnmEntityPlugin = createPlugin({
  id: 'metrics and monitoring entity',
});

export const EntityMnmEntityContent = mnmEntityPlugin.provide(
  createComponentExtension({
    name: 'EntityMnmEntityContent',
    component: {
      lazy: () => import('./components/MnmEntityComponent').then(m => m.MnmEntityComponent),
    },
  }),
);
