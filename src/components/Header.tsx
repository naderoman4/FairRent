import { Scale } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <a href="/" className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-gray-900">FairRent</span>
        </a>
        <span className="ml-3 text-xs text-muted-foreground hidden sm:inline">
          Encadrement des loyers à Paris
        </span>
      </div>
    </header>
  );
}
