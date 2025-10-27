import Link from 'next/link';
import { BookOpen, Code, Zap, ArrowRight, Github } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Deeptoai RAG系列教程
          </h1>
          <p className="mb-8 text-lg text-fd-muted-foreground sm:text-xl md:text-2xl">
            全面系统的 RAG（检索增强生成）技术学习教程
          </p>
          <p className="mb-10 text-base text-fd-muted-foreground md:text-lg">
            从基础概念到高级实战，涵盖向量搜索、多查询策略、索引优化、检索重排序等核心技术
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-6 py-3 text-base font-semibold text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
            >
              开始学习
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/foreveryh/Awesome-LLM-RAG-tutorial/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-6 py-3 text-base font-semibold transition-colors hover:bg-fd-accent"
            >
              <Github className="h-4 w-4" />
              GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-fd-border bg-fd-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            教程特色
          </h2>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-fd-primary/10">
                <BookOpen className="h-6 w-6 text-fd-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">系统全面</h3>
              <p className="text-fd-muted-foreground">
                从入门到深入，再到实战，完整的学习路径和知识体系
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-fd-primary/10">
                <Code className="h-6 w-6 text-fd-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">实战导向</h3>
              <p className="text-fd-muted-foreground">
                丰富的代码示例和项目实战分析，直接应用于生产环境
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-fd-primary/10">
                <Zap className="h-6 w-6 text-fd-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">持续更新</h3>
              <p className="text-fd-muted-foreground">
                紧跟 RAG 技术发展，不断补充最新的理论和实践
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">
          快速导航
        </h2>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <Link
            href="/docs"
            className="group rounded-lg border border-fd-border p-6 transition-all hover:border-fd-primary hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold group-hover:text-fd-primary">
              📖 必读综述
            </h3>
            <p className="text-fd-muted-foreground">
              面向大语言模型的检索增强生成技术综述，了解 RAG 的核心概念和发展脉络
            </p>
          </Link>

          <Link
            href="/docs/初识-Advanced-RAG"
            className="group rounded-lg border border-fd-border p-6 transition-all hover:border-fd-primary hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold group-hover:text-fd-primary">
              🚀 初识 Advanced RAG
            </h3>
            <p className="text-fd-muted-foreground">
              从基础入门，学习高级 RAG 技术的核心概念和实现方法
            </p>
          </Link>

          <Link
            href="/docs/深入-Advanced-RAG"
            className="group rounded-lg border border-fd-border p-6 transition-all hover:border-fd-primary hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold group-hover:text-fd-primary">
              💡 深入 Advanced RAG
            </h3>
            <p className="text-fd-muted-foreground">
              深入理解高级 RAG 概念、优化策略和实现细节
            </p>
          </Link>

          <Link
            href="/docs/实践-Advanced-RAG"
            className="group rounded-lg border border-fd-border p-6 transition-all hover:border-fd-primary hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold group-hover:text-fd-primary">
              ⚙️ 实践 Advanced RAG
            </h3>
            <p className="text-fd-muted-foreground">
              动手实践 RAG 实现，通过真实案例掌握应用技巧
            </p>
          </Link>

          <Link
            href="/docs/从零到一-RAG-实战"
            className="group rounded-lg border border-fd-border p-6 transition-all hover:border-fd-primary hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold group-hover:text-fd-primary">
              🛠️ 从零到一 RAG 实战
            </h3>
            <p className="text-fd-muted-foreground">
              完整的项目实战教程，从零开始构建一个生产级 RAG 系统
            </p>
          </Link>

          <Link
            href="/docs/RAG项目实战分析"
            className="group rounded-lg border border-fd-border p-6 transition-all hover:border-fd-primary hover:shadow-lg"
          >
            <h3 className="mb-2 text-xl font-semibold group-hover:text-fd-primary">
              📊 RAG 项目实战分析
            </h3>
            <p className="text-fd-muted-foreground">
              开源项目实战总结与选型指南，帮助你快速上手
            </p>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="border-t border-fd-border bg-fd-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">联系我们</h2>
          <p className="mb-6 text-fd-muted-foreground">
            有问题或建议？欢迎联系项目维护者
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="https://x.com/Stephen4171127"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @Stephen4171127
            </Link>
            <span className="text-fd-muted-foreground">|</span>
            <Link
              href="https://github.com/foreveryh/Awesome-LLM-RAG-tutorial/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-fd-muted-foreground transition-colors hover:text-fd-foreground"
            >
              <Github className="h-5 w-5" />
              GitHub Issues
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
