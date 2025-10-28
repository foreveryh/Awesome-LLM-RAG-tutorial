import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import 'katex/dist/katex.css';
import { ContactFloat } from '@/components/contact-float';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Deeptoai RAG系列教程',
    default: 'Deeptoai RAG系列教程',
  },
  description:
    '全面系统的 RAG（检索增强生成）技术学习教程。从基础概念到高级实战，涵盖向量搜索、多查询策略、索引优化、检索重排序等核心技术，助力开发者掌握大语言模型的知识增强方法。',
  keywords: [
    'RAG',
    '检索增强生成',
    'Retrieval-Augmented Generation',
    'LLM',
    '大语言模型',
    '向量搜索',
    'Vector Search',
    'AI教程',
    'Deeptoai',
    '知识库',
    'Embedding',
  ],
  authors: [{ name: 'Deeptoai' }],
  creator: 'Deeptoai',
  publisher: 'Deeptoai',
  metadataBase: new URL('https://rag.deeptoai.com'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://rag.deeptoai.com',
    siteName: 'Deeptoai RAG系列教程',
    title: 'Deeptoai RAG系列教程',
    description:
      '全面系统的 RAG（检索增强生成）技术学习教程，从基础到实战的完整学习路径。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deeptoai RAG系列教程',
    description:
      '全面系统的 RAG（检索增强生成）技术学习教程，从基础到实战的完整学习路径。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
        <ContactFloat />
      </body>
      <GoogleAnalytics gaId="G-DPV0373FKP" />
    </html>
  );
}
