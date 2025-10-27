import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Deeptoai RAG系列教程',
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        text: 'GitHub',
        url: 'https://github.com/foreveryh/Awesome-LLM-RAG-tutorial/',
        active: 'nested-url',
      },
      {
        text: 'Twitter',
        url: 'https://x.com/Stephen4171127',
        external: true,
      },
      {
        text: 'Deeptoai',
        url: 'https://deeptoai.com',
      },
    ],
  };
}
