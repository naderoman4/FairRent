'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Scale, Loader2 } from 'lucide-react';
import Link from 'next/link';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const teamId = searchParams.get('team');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/signup?redirect=/join?team=${teamId}`);
      return;
    }

    if (!teamId) {
      setStatus('error');
      setError('Lien d\'invitation invalide.');
      return;
    }

    setStatus('success');
    router.push('/dashboard');
  }, [user, loading, teamId, router]);

  return (
    <div className="text-center space-y-6">
      <Link href="/" className="inline-flex items-center gap-2">
        <Scale className="h-8 w-8 text-primary" />
        <span className="font-bold text-2xl text-gray-900">FairRent</span>
      </Link>

      {status === 'loading' && (
        <div className="space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Traitement de l&apos;invitation...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <p className="text-red-600">{error}</p>
          <Link href="/" className="text-sm text-primary hover:underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      )}
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2">
          <Scale className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl text-gray-900">FairRent</span>
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
