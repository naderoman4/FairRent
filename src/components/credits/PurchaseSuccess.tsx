'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function PurchaseSuccess() {
  const searchParams = useSearchParams();
  const { refreshCredits } = useAuth();
  const [show, setShow] = useState(false);
  const credits = searchParams.get('credits');

  useEffect(() => {
    if (searchParams.get('purchase') === 'success' && credits) {
      setShow(true);
      refreshCredits();

      const timer = setTimeout(() => setShow(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, credits, refreshCredits]);

  if (!show) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
      <div>
        <p className="text-sm font-medium text-green-900">
          Achat réussi !
        </p>
        <p className="text-sm text-green-700">
          {credits} crédit{Number(credits) > 1 ? 's' : ''} {Number(credits) > 1 ? 'ont été ajoutés' : 'a été ajouté'} à votre compte.
        </p>
      </div>
    </div>
  );
}
