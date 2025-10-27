// Global fallback types for typed routes used in this project
// If your environment provides real typed routes, remove this file.

declare type LayoutProps<_Path extends string = string> = {
  children: import('react').ReactNode;
};

declare type PageProps<_Path extends string = string> = {
  params: Promise<{ slug?: string[] }>;
};

declare type RouteContext<_Path extends string = string> = {
  params: Promise<{ slug: string[] }>;
};
