'use client';

import React, { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { Copy, Check } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

// Memoized to prevent re-renders unless `content` string itself changes.
// This is the core fix — React.memo does a shallow comparison on props,
// so the SyntaxHighlighter only re-runs when a complete new chunk of text arrives.
const MarkdownRenderer = memo(function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="w-full markdown-content overflow-x-hidden max-w-full min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && match) {
              return <CodeBlock language={language} code={codeString} />;
            }

            return (
              <code
                className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded-md text-[0.9em] border border-cyan-500/20 font-mono break-all"
                dir="ltr"
                {...props}
              >
                {children}
              </code>
            );
          },
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl font-bold mt-6 mb-4 text-violet-500 flex flex-wrap items-baseline gap-x-1"
              dir="auto"
              style={{ overflowWrap: 'anywhere' }}
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl font-bold mt-5 mb-3 text-cyan-500 flex flex-wrap items-baseline gap-x-1"
              dir="auto"
              style={{ overflowWrap: 'anywhere' }}
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg font-bold mt-4 mb-2 text-fuchsia-500 flex flex-wrap items-baseline gap-x-1"
              dir="auto"
              style={{ overflowWrap: 'anywhere' }}
              {...props}
            />
          ),
          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-3 text-[15px]" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-3 text-[15px]" {...props} />,
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          p: ({ node, ...props }) => <p className="leading-relaxed mb-4 text-[15px] break-words" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-[var(--text)]" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-r-4 border-cyan-500 bg-cyan-500/5 py-2 px-4 rounded-l-xl my-4 text-slate-400 italic" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 border border-[var(--border)] rounded-xl max-w-full">
              <table className="w-full text-sm text-right" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="px-4 py-3 bg-[var(--surface2)] font-bold border-b border-[var(--border)]" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-3 border-b border-[var(--border)]" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;

// Memoized separately so the Copy button state doesn't cause the parent to re-render
const CodeBlock = memo(function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="my-4 rounded-xl overflow-hidden border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.08)] bg-[#1e1e1e] max-w-full min-w-0"
      dir="ltr"
    >
      {/* Code block header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161616] border-b border-white/5 shrink-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      {/* Scrollable code area — overflow-x-auto prevents the parent from stretching */}
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, background: 'transparent', padding: '1rem', minWidth: 0 }}
          wrapLongLines={false}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});
