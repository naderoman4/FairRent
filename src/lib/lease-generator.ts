import Anthropic from '@anthropic-ai/sdk';
import { getLeaseGenerationPrompt } from './prompts/lease-generation';
import type { LeaseGenData } from './types-lease-gen';

const anthropic = new Anthropic();

interface GenerationResult {
  specialConditions: string;
  complementJustification: string | null;
}

export async function generateLeaseContent(
  data: LeaseGenData
): Promise<GenerationResult> {
  const hasSpecialConditions = data.terms.specialConditions.trim().length > 0;
  const hasComplement = data.financial.complementLoyer && data.financial.complementLoyerJustification;

  // If no text needs LLM processing, return as-is
  if (!hasSpecialConditions && !hasComplement) {
    return {
      specialConditions: '',
      complementJustification: null,
    };
  }

  const prompt = getLeaseGenerationPrompt(
    data.terms.specialConditions,
    hasComplement ? data.financial.complementLoyerJustification : null
  );

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  try {
    // Strip markdown fences if present
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      specialConditions: parsed.specialConditions || data.terms.specialConditions,
      complementJustification: parsed.complementJustification || data.financial.complementLoyerJustification,
    };
  } catch {
    // If parsing fails, return original text
    return {
      specialConditions: data.terms.specialConditions,
      complementJustification: data.financial.complementLoyerJustification,
    };
  }
}
