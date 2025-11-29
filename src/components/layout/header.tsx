import Link from 'next/link';
import { Home } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export function Header() {
  return (
    <header className="relative sticky top-0 z-50 w-full overflow-hidden bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-white shadow-md">
      {/* Soft mesh background with a light glass overlay to echo primary buttons */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <img src="/images/header-mesh.svg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-white/10 backdrop-blur supports-[backdrop-filter]:bg-white/15" />
      </div>
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-auto select-none">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5 text-white drop-shadow-sm" />
            <span className="font-headline text-lg font-semibold text-white">JobTailor</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-end gap-2">
          {/* Compact top tabs could be reintroduced here */}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}



