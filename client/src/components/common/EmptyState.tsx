import type { ReactNode } from 'react';

export const EmptyState = ({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
    <h2 className="font-serif text-title text-ink">{title}</h2>
    {children && <p className="text-muted-foreground">{children}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
