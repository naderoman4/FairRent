import Link from 'next/link';
import { Scale } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2">
          <Scale className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl text-gray-900">FairRent</span>
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
