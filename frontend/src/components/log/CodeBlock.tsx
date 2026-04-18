import type { ReactNode } from 'react';

interface Props {
  lang?: string;
  filename?: string;
  children: ReactNode;
}

/**
 * Lightweight code block — no syntax highlighting runtime dep; just semantic
 * pre/code with a small header showing language + optional filename.
 * Keeps the page fast and the theme coherent.
 */
export default function CodeBlock({ lang, filename, children }: Props) {
  return (
    <pre className="log-code">
      {(lang || filename) && (
        <div className="log-code-head">
          <span>{filename || ''}</span>
          <span>{lang ? `[${lang}]` : ''}</span>
        </div>
      )}
      <code>{children}</code>
    </pre>
  );
}
