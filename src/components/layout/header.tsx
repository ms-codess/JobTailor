import Link from 'next/link';
import { Home } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export function Header() {
  return (
    <header className="relative sticky top-0 z-50 w-full overflow-hidden border-b border-white/40 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      {/* Animated background photo + gradient overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 -z-10 opacity-25"><img src="/patterns/grid.svg" alt="" className="h-full w-full object-cover"/></div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(168,85,247,0.25),rgba(217,70,239,0.25),rgba(236,72,153,0.2))] animate-gradient" />
      </div>
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-auto select-none">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5 text-purple-600 drop-shadow-sm" />
            <span className="font-headline text-lg font-semibold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">JobTailor</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center justify-end gap-2">
          {/* Compact top tabs could be reintroduced here */}
          <ThemeToggle />
        </nav>
      </div>
      {/* Animated accent bar */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[linear-gradient(90deg,#a855f7,#d946ef,#ec4899,#a855f7)] animate-gradient" />
    </header>
  );
}





