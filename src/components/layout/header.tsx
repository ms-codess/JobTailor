import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Link href="/tailor" className="text-sm font-medium hover:underline">Tailor</Link>
          <Link href="/build" className="text-sm font-medium hover:underline">Build</Link>
        </div>
      </div>
    </header>
  );
}
