import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function GuideCTA() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 my-10 text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Vérifiez votre bail gratuitement
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Importez votre bail ou remplissez le formulaire pour savoir si votre loyer respecte la loi.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Vérifier mon loyer
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
