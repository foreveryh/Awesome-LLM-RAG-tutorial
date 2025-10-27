'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X } from 'lucide-react';

export function ContactFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-fd-primary text-fd-primary-foreground shadow-lg transition-all hover:scale-110 hover:shadow-xl md:h-16 md:w-16"
        aria-label="联系我们"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Popup Card */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Card */}
          <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-4 rounded-lg border border-fd-border bg-fd-background p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">企业级 RAG 咨询</h3>
            <p className="mb-4 text-sm text-fd-muted-foreground">
              如果你对<strong>企业级 RAG 实施</strong>或<strong>深度学习</strong>感兴趣，欢迎联系我进行交流与咨询。
            </p>
            <div className="space-y-3">
              <Link
                href="https://x.com/Stephen4171127"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md border border-fd-border p-3 transition-colors hover:bg-fd-accent"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="h-5 w-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Twitter/X</div>
                  <div className="text-xs text-fd-muted-foreground">
                    @Stephen4171127
                  </div>
                </div>
              </Link>
              <div className="flex items-center gap-3 rounded-md border border-fd-border bg-fd-muted/30 p-3">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">微信</div>
                  <div className="text-xs font-mono text-fd-muted-foreground">
                    browncony999
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('browncony999');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-fd-accent"
                  title="复制微信号"
                >
                  {copied ? '✓ 已复制' : '复制'}
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs text-fd-muted-foreground text-center">
              欢迎技术交流与合作咨询 🤝
            </p>
          </div>
        </>
      )}
    </>
  );
}
