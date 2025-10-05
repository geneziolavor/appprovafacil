'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Voltar</span>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-7 w-7 text-muted-foreground" />}
            <h1 className="text-3xl font-bold font-headline text-foreground">{title}</h1>
          </div>
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
