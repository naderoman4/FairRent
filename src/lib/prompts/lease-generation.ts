export function getLeaseGenerationPrompt(
  specialConditions: string,
  complementJustification: string | null
): string {
  return `Tu es un assistant juridique spécialisé dans les baux d'habitation en France (loi du 6 juillet 1989).

${complementJustification ? `TÂCHE 1 — Reformulation de la justification du complément de loyer :
Le propriétaire a fourni cette justification : "${complementJustification}"
Reformule-la de manière juridiquement précise pour un bail, en mentionnant les caractéristiques de confort ou de localisation déterminantes, conformément à l'article 140 de la loi ELAN.
` : ''}

TÂCHE ${complementJustification ? '2' : '1'} — Mise en forme des conditions particulières :
Le propriétaire a saisi les conditions particulières suivantes : "${specialConditions}"
Reformule-les de manière claire, structurée et juridiquement appropriée pour un bail d'habitation. Numérote chaque condition.

Réponds au format JSON :
{
  ${complementJustification ? '"complementJustification": "texte reformulé",' : ''}
  "specialConditions": "conditions reformulées et numérotées"
}

Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;
}
