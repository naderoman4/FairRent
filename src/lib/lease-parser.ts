import Anthropic from '@anthropic-ai/sdk';
import type { LeaseData } from './types';

const SYSTEM_PROMPT = `You are a French lease document analyzer. Extract the following fields from the lease text. Return a JSON object with two keys: "data" and "confidence".

For "data", return an object with the following fields (use null for fields you cannot find):
- address (full address of the rented property)
- postalCode
- city
- rentExcludingCharges (loyer hors charges mensuel in euros, as a number)
- charges (provision pour charges in euros, as a number)
- surface (surface habitable in m², as a number)
- numberOfRooms (nombre de pièces principales — count, not including kitchen/bathroom, as a number)
- furnished (boolean: is it a meublé?)
- constructionPeriod (one of: "Avant 1946", "1946-1970", "1971-1990", "Apres 1990", or null)
- leaseStartDate (date de prise d'effet du bail, in YYYY-MM-DD format)
- complementLoyer (complément de loyer in euros, as a number, null if none)
- complementLoyerJustification (justification text for complément de loyer, null if none)
- mentionsReferenceRent (boolean: does the lease text mention "loyer de référence"?)
- mentionsMaxRent (boolean: does the lease text mention "loyer de référence majoré"?)
- dpeClass (DPE energy class A-G if mentioned, null otherwise)

For "confidence", return an object with the same field names, each with a number 0-1 indicating your confidence in the extracted value.

IMPORTANT: Return ONLY the raw JSON object. No markdown fences, no backticks, no explanation, no text before or after the JSON.`;

interface ParseResult {
  data: Partial<LeaseData>;
  confidence: Record<string, number>;
}

export async function parseLeaseWithClaude(text: string): Promise<ParseResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }

  const client = new Anthropic({ apiKey });

  // Truncate text if too long (Claude has context limits)
  const maxChars = 80000;
  const truncatedText = text.length > maxChars ? text.slice(0, maxChars) : text;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: truncatedText,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response from AI model.');
  }

  try {
    // Strip markdown fences if present (```json ... ```)
    let jsonText = content.text.trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim();
    }

    const parsed: ParseResult = JSON.parse(jsonText);
    return {
      data: parsed.data || {},
      confidence: parsed.confidence || {},
    };
  } catch {
    // Last resort: try to find any JSON object in the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed: ParseResult = JSON.parse(jsonMatch[0]);
        return {
          data: parsed.data || {},
          confidence: parsed.confidence || {},
        };
      } catch {
        // fall through
      }
    }
    throw new Error('Impossible d\'analyser la réponse. Veuillez remplir le formulaire manuellement.');
  }
}
