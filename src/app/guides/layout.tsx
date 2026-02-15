import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

const guides = [
  { href: '/guides/encadrement-loyers-paris', title: 'Encadrement des loyers' },
  { href: '/guides/verifier-loyer-paris', title: 'Vérifier son loyer' },
  { href: '/guides/complement-de-loyer', title: 'Complément de loyer' },
  { href: '/guides/clauses-abusives-bail', title: 'Clauses abusives' },
  { href: '/guides/dpe-location', title: 'DPE et location' },
  { href: '/guides/droits-locataire-paris', title: 'Droits du locataire' },
  { href: '/guides/surface-habitable-bail', title: 'Surface habitable' },
  { href: '/guides/depot-de-garantie', title: 'Dépôt de garantie' },
];

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-[220px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="hidden md:block">
              <nav className="sticky top-20 space-y-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Guides</h3>
                {guides.map((g) => (
                  <Link
                    key={g.href}
                    href={g.href}
                    className="block text-sm text-gray-600 hover:text-primary py-1.5 px-2 rounded hover:bg-blue-50 transition-colors"
                  >
                    {g.title}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <article className="min-w-0 prose-custom">
              {children}
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
