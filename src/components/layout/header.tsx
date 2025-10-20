import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-4 flex items-center">
          <Briefcase className="h-6 w-6 mr-2 text-primary" />
          <h1 className="font-headline text-2xl font-bold text-primary">
            JobTailor
          </h1>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Login and Sign Up buttons removed */}
        </div>
      </div>
    </header>
  );
}
