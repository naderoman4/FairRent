'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { signIn, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signInWithMagicLink(email);
    if (result.error) {
      setError(result.error);
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  };

  if (magicLinkSent) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Vérifiez votre boîte mail</h2>
        <p className="text-muted-foreground text-sm">
          Nous avons envoyé un lien de connexion à <strong>{email}</strong>.
          Cliquez sur le lien pour vous connecter.
        </p>
        <button
          onClick={() => { setMagicLinkSent(false); setMagicLinkMode(false); }}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Se connecter</h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={magicLinkMode ? handleMagicLink : handlePasswordLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse e-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="vous@exemple.fr"
            />
          </div>
        </div>

        {!magicLinkMode && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="Votre mot de passe"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {magicLinkMode ? 'Envoyer le lien magique' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => { setMagicLinkMode(!magicLinkMode); setError(null); }}
          className="text-sm text-primary hover:underline"
        >
          {magicLinkMode
            ? 'Se connecter avec un mot de passe'
            : 'Recevoir un lien de connexion par e-mail'}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
