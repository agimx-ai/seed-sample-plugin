import { buildPlugin } from '@motus-ai/seed-sdk/tools';

await buildPlugin({
  root: import.meta.dirname,
  service: 'src/service.ts',
  resources: [
    { source: 'docs/plugin/README.md', path: 'README.md' },
    { source: 'docs/plugin/README.zh-CN.md', path: 'README.zh-CN.md' },
  ],
});
