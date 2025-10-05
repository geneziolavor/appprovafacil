import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
          <GraduationCap className="h-7 w-7 text-primary-foreground fill-accent" />
          <span className="font-headline">ProvaFácil</span>
        </Link>
      </div>
    </header>
  );
}
