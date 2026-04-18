import type { ReactNode } from 'react';

type Kind = 'info' | 'warn' | 'tip' | 'quote';

interface Props {
  kind?: Kind;
  title?: string;
  children: ReactNode;
}

const LABEL: Record<Kind, string> = {
  info: 'note',
  warn: 'caveat',
  tip: 'tip',
  quote: 'quote',
};

export default function Callout({ kind = 'info', title, children }: Props) {
  return (
    <aside className={`log-callout log-callout-${kind}`} role="note">
      <div className="log-callout-label">{title || LABEL[kind]}</div>
      {children}
    </aside>
  );
}
