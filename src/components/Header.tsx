import Link from 'next/link';
import { Scale } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-gray-900">FairRent</span>
          </Link>
          <span className="ml-3 text-xs text-muted-foreground hidden sm:inline">
            Encadrement des loyers à Paris
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/guides/encadrement-loyers-paris"
            className="text-sm text-gray-600 hover:text-primary transition-colors hidden sm:inline"
          >
            Guides
          </Link>
        </nav>
      </div>
    </header>
  );
}
