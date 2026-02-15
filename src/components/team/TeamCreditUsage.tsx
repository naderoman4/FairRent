interface UsageEntry {
  userId: string;
  email: string;
  creditsUsed: number;
}

interface Props {
  usage: UsageEntry[];
}

export function TeamCreditUsage({ usage }: Props) {
  if (usage.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center">
        <p className="text-sm text-muted-foreground">Aucune utilisation de crédits pour le moment.</p>
      </div>
    );
  }

  const totalUsed = usage.reduce((sum, u) => sum + u.creditsUsed, 0);

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Membre</th>
            <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Crédits utilisés</th>
          </tr>
        </thead>
        <tbody>
          {usage.map((entry) => (
            <tr key={entry.userId} className="border-b last:border-0">
              <td className="px-4 py-3 text-sm text-gray-900">{entry.email}</td>
              <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{entry.creditsUsed}</td>
            </tr>
          ))}
          <tr className="bg-gray-50">
            <td className="px-4 py-3 text-sm font-semibold text-gray-900">Total</td>
            <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">{totalUsed}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
