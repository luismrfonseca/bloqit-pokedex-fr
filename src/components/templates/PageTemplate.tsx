import { ReactNode } from 'react';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
  topContent?: ReactNode;
  children: ReactNode;
}

export function PageTemplate({
  title,
  subtitle,
  headerAction,
  topContent,
  children,
}: PageTemplateProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
        {headerAction && (
          <div className="whitespace-nowrap ml-4">{headerAction}</div>
        )}
      </div>

      {topContent && (
        <div className="flex flex-col gap-4">
          {topContent}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
