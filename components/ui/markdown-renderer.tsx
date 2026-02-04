'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Simple Markdown renderer for chat responses
 * Handles: headers, bold, italic, code blocks, inline code, lists, links
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const renderMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const ListTag = listType;
        elements.push(
          <ListTag 
            key={`list-${elements.length}`} 
            className={cn(
              'my-2 space-y-1',
              listType === 'ul' ? 'list-disc list-inside' : 'list-decimal list-inside'
            )}
          >
            {listItems.map((item, i) => (
              <li key={i} className="text-sm">{renderInline(item)}</li>
            ))}
          </ListTag>
        );
        listItems = [];
        listType = null;
      }
    };

    const renderInline = (line: string): React.ReactNode => {
      // Process inline elements: bold, italic, code, links
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let key = 0;

      while (remaining.length > 0) {
        // Inline code
        const codeMatch = remaining.match(/`([^`]+)`/);
        // Bold
        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
        // Italic
        const italicMatch = remaining.match(/\*([^*]+)\*/);
        // Link
        const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

        // Find earliest match
        const matches = [
          codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
          boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
          italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
          linkMatch ? { type: 'link', match: linkMatch, index: linkMatch.index! } : null,
        ].filter(Boolean).sort((a, b) => a!.index - b!.index);

        if (matches.length === 0) {
          parts.push(remaining);
          break;
        }

        const earliest = matches[0]!;
        
        // Add text before match
        if (earliest.index > 0) {
          parts.push(remaining.substring(0, earliest.index));
        }

        // Add formatted element
        switch (earliest.type) {
          case 'code':
            parts.push(
              <code key={key++} className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono">
                {earliest.match![1]}
              </code>
            );
            break;
          case 'bold':
            parts.push(<strong key={key++}>{earliest.match![1]}</strong>);
            break;
          case 'italic':
            parts.push(<em key={key++}>{earliest.match![1]}</em>);
            break;
          case 'link':
            parts.push(
              <a 
                key={key++} 
                href={earliest.match![2]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {earliest.match![1]}
              </a>
            );
            break;
        }

        remaining = remaining.substring(earliest.index + earliest.match![0].length);
      }

      return parts.length === 1 ? parts[0] : <>{parts}</>;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start/end
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          flushList();
          inCodeBlock = true;
          codeBlockLang = line.slice(3).trim();
          codeBlockContent = [];
        } else {
          elements.push(
            <pre 
              key={`code-${elements.length}`} 
              className="my-3 p-4 rounded-lg bg-zinc-900 text-zinc-100 overflow-x-auto"
            >
              <code className="text-sm font-mono">{codeBlockContent.join('\n')}</code>
            </pre>
          );
          inCodeBlock = false;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${elements.length}`} className="text-base font-semibold mt-3 mb-1">
            {renderInline(line.slice(4))}
          </h3>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${elements.length}`} className="text-lg font-semibold mt-4 mb-2">
            {renderInline(line.slice(3))}
          </h2>
        );
        continue;
      }
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={`h1-${elements.length}`} className="text-xl font-bold mt-4 mb-2">
            {renderInline(line.slice(2))}
          </h1>
        );
        continue;
      }

      // Unordered list
      if (line.match(/^[-*]\s/)) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(line.slice(2));
        continue;
      }

      // Ordered list
      if (line.match(/^\d+\.\s/)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(line.replace(/^\d+\.\s/, ''));
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        flushList();
        elements.push(<br key={`br-${elements.length}`} />);
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="text-sm leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }

    flushList();
    return elements;
  };

  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      {renderMarkdown(content)}
    </div>
  );
}

export default MarkdownRenderer;
