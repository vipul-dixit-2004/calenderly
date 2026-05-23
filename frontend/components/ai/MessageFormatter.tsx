import React from 'react';

interface MessageFormatterProps {
  content: string;
}

export default function MessageFormatter({ content }: MessageFormatterProps) {
  const parseInline = (text: string) => {
    // Regex splits by **, *, `, and newlines.
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\n)/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part === '\n') {
        return <br key={index} />;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} style={{ 
            background: 'var(--color-bg-secondary)', 
            padding: '2px 4px', 
            borderRadius: '4px', 
            fontFamily: 'monospace',
            fontSize: '13px'
          }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Split content by double newlines for paragraphs
  const paragraphs = content.split('\n\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {paragraphs.map((p, i) => (
        <div key={i}>
          {parseInline(p)}
        </div>
      ))}
    </div>
  );
}
