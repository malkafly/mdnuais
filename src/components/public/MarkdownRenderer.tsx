"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { slugify } from "@/lib/markdown";
import { CodeBlock } from "./CodeBlock";
import { Link2 } from "lucide-react";
import { ComponentPropsWithoutRef } from "react";

interface MarkdownRendererProps {
  content: string;
  codeHighlights?: Record<string, string>;
}

function HeadingWithAnchor({
  level,
  children,
  ...props
}: ComponentPropsWithoutRef<"h1"> & { level: number }) {
  const text = extractText(children);
  const id = slugify(text);
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  const handleCopy = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <Tag id={id} {...props}>
      {children}
      <button
        onClick={handleCopy}
        className="heading-anchor inline-flex items-center align-middle"
        aria-label="Copiar link"
      >
        <Link2 className="w-4 h-4" />
      </button>
    </Tag>
  );
}

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

export function MarkdownRenderer({ content, codeHighlights }: MarkdownRendererProps) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: (props) => <HeadingWithAnchor level={1} {...props} />,
          h2: (props) => <HeadingWithAnchor level={2} {...props} />,
          h3: (props) => <HeadingWithAnchor level={3} {...props} />,
          h4: (props) => <HeadingWithAnchor level={4} {...props} />,
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (match) {
              const lang = match[1];
              const highlightKey = `${lang}:${codeString}`;
              const html = codeHighlights?.[highlightKey];

              return (
                <CodeBlock
                  code={codeString}
                  language={lang}
                  html={html}
                />
              );
            }

            return <code className={className}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
