'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, X } from 'lucide-react';

export function ContactFloat() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

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
              <div className="space-y-3">
                <div
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-fd-border bg-fd-muted/30 p-3 transition-colors hover:bg-fd-accent"
                >
                  <Image
                    src="/icons/wechat.png"
                    alt="WeChat"
                    width={20}
                    height={20}
                    className="h-5 w-5 flex-shrink-0"
                  />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">微信</div>
                    <div className="text-xs font-mono text-fd-muted-foreground">
                      browncony999
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText('browncony999');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-fd-background"
                      title="复制微信号"
                    >
                      {copied ? '✓ 已复制' : '复制'}
                    </button>
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        showQRCode ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* QR Code Section */}
                {showQRCode && (
                  <div className="animate-in slide-in-from-top-2 space-y-2 rounded-md border border-fd-border bg-fd-background p-4">
                    <p className="text-center text-sm font-medium">
                      扫码添加微信
                    </p>
                    <div className="flex justify-center">
                      <Image
                        src="/wechat_browncony999.jpg"
                        alt="微信二维码"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-center text-xs text-fd-muted-foreground">
                      微信号: browncony999
                    </p>
                  </div>
                )}
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
