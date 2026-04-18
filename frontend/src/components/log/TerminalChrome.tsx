import { type ReactNode } from 'react';

interface Props {
  /** e.g. "~/log — bash" */
  tab: string;
  /** Right side of title bar. e.g. "80×24" */
  meta?: string;
  children: ReactNode;
}

/**
 * Terminal window chrome — traffic lights + title tab + shell meta.
 * Purely decorative; `children` is the real content.
 */
export default function TerminalChrome({ tab, meta, children }: Props) {
  return (
    <div className="log-window-frame">
      <div className="log-titlebar" aria-hidden="true">
        <span className="log-traffic">
          <span /><span /><span />
        </span>
        <span className="log-tabs">{tab}</span>
        {meta && <span className="log-shell-meta">{meta}</span>}
      </div>
      <div className="log-body">{children}</div>
    </div>
  );
}
