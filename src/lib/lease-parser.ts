import Anthropic from '@anthropic-ai/sdk';
import type { LeaseData, ComplianceIssue } from './types';
import { CLAUSE_ANALYSIS_PROMPT } from './prompts/clause-analysis';

const EXTRACTION_PROMPT = `You are a French lease document analyzer. Extract the following fields from the lease text. Return a JSON object with two keys: "data" and "confidence".

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
- depositAmount (dépôt de garantie in euros, as a number, null if not mentioned)
- agencyFees (honoraires à la charge du locataire in euros, as a number, null if not mentioned)
- leaseType (one of: "loi_1989", "mobilite", "code_civil", "other", or null)
- leaseDuration (durée du bail in months, as a number, null if not mentioned)

For "confidence", return an object with the same field names, each with a number 0-1 indicating your confidence in the extracted value.

IMPORTANT: Return ONLY the raw JSON object. No markdown fences, no backticks, no explanation, no text before or after the JSON.`;

interface ParseResult {
  data: Partial<LeaseData>;
  confidence: Record<string, number>;
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }
  return new Anthropic({ apiKey });
}

function parseJsonResponse(text: string): unknown {
  let jsonText = text.trim();
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(jsonText);
  } catch {
    const jsonMatch = text.match(/[\[{][\s\S]*[\]}]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Could not parse JSON response');
  }
}

export async function parseLeaseWithClaude(text: string): Promise<ParseResult> {
  const client = getClient();

  const maxChars = 80000;
  const truncatedText = text.length > maxChars ? text.slice(0, maxChars) : text;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    system: EXTRACTION_PROMPT,
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
    const parsed = parseJsonResponse(content.text) as ParseResult;
    return {
      data: parsed.data || {},
      confidence: parsed.confidence || {},
    };
  } catch {
    throw new Error('Impossible d\'analyser la réponse. Veuillez remplir le formulaire manuellement.');
  }
}

export async function analyzeClausesWithClaude(text: string): Promise<ComplianceIssue[]> {
  const client = getClient();

  const maxChars = 80000;
  const truncatedText = text.length > maxChars ? text.slice(0, maxChars) : text;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    system: CLAUSE_ANALYSIS_PROMPT,
    messages: [
      {
        role: 'user',
        content: truncatedText,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    return [];
  }

  try {
    const parsed = parseJsonResponse(content.text) as ComplianceIssue[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((issue) => ({
      ...issue,
      category: 'clauses' as const,
    }));
  } catch {
    return [];
  }
}

export async function parseAndAnalyzeWithClaude(text: string): Promise<{
  data: Partial<LeaseData>;
  confidence: Record<string, number>;
  clauseIssues: ComplianceIssue[];
}> {
  const [parseResult, clauseIssues] = await Promise.all([
    parseLeaseWithClaude(text),
    analyzeClausesWithClaude(text),
  ]);

  return {
    data: parseResult.data,
    confidence: parseResult.confidence,
    clauseIssues,
  };
}
