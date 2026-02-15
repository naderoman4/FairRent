export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
        <div className="flex justify-center gap-6 mb-4">
          <a href="/analyser" className="hover:text-foreground transition-colors">Vérifier mon loyer</a>
          <a href="/pricing" className="hover:text-foreground transition-colors">Tarifs</a>
          <a href="/guides/encadrement-loyers-paris" className="hover:text-foreground transition-colors">Guides</a>
        </div>
        <p>
          Outil informatif — ne constitue pas un avis juridique.
          Les données proviennent de{' '}
          <a
            href="https://opendata.paris.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Paris Open Data
          </a>
          .
        </p>
        <p>
          Votre bail est analysé en temps réel et n&apos;est jamais conservé sur nos serveurs.
        </p>
      </div>
    </footer>
  );
}
