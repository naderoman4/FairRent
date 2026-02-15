import { NextRequest } from 'next/server';
import { extractPdfText } from '@/lib/pdf-extractor';
import { analyzeClausesWithClaude, parseAndAnalyzeWithClaude } from '@/lib/lease-parser';
import { checkRateLimit } from '@/lib/rate-limit';
import { MAX_PDF_SIZE_BYTES, MAX_CLAUSE_TEXT_LENGTH } from '@/lib/constants';

function encode(data: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(data) + '\n');
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const rateLimitResult = checkRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: rateLimitResult.message }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const contentType = request.headers.get('content-type') || '';
  const isJsonRequest = contentType.includes('application/json');

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (isJsonRequest) {
          // ─── Text-only mode (copy-paste / wizard step 4) ───
          const body = await request.json();
          const text = body.text;
          const mode = body.mode || 'clauses_only'; // 'full' or 'clauses_only'

          if (!text || typeof text !== 'string') {
            controller.enqueue(encode({ error: 'Aucun texte fourni.' }));
            controller.close();
            return;
          }

          if (text.length > MAX_CLAUSE_TEXT_LENGTH) {
            controller.enqueue(encode({ error: `Le texte dépasse la limite de ${MAX_CLAUSE_TEXT_LENGTH} caractères.` }));
            controller.close();
            return;
          }

          controller.enqueue(encode({ step: 'analyzing', message: 'Analyse des clauses...' }));

          if (mode === 'full') {
            // Full extraction + clause analysis (copy-paste mode)
            const result = await parseAndAnalyzeWithClaude(text);
            controller.enqueue(
              encode({
                step: 'done',
                data: result.data,
                confidence: result.confidence,
                clauseIssues: result.clauseIssues,
              })
            );
          } else {
            // Clause analysis only (wizard step 4)
            const clauseIssues = await analyzeClausesWithClaude(text);
            controller.enqueue(
              encode({
                step: 'done',
                clauseIssues,
              })
            );
          }

          controller.close();
        } else {
          // ─── PDF mode (extraction + clause analysis in parallel) ───
          const formData = await request.formData();
          const file = formData.get('file');

          if (!file || !(file instanceof File)) {
            controller.enqueue(encode({ error: 'Aucun fichier PDF fourni.' }));
            controller.close();
            return;
          }

          if (file.type !== 'application/pdf') {
            controller.enqueue(encode({ error: 'Le fichier doit être un PDF.' }));
            controller.close();
            return;
          }

          if (file.size > MAX_PDF_SIZE_BYTES) {
            controller.enqueue(encode({ error: 'Le fichier dépasse la limite de 20 Mo.' }));
            controller.close();
            return;
          }

          // Step 1: Extract text from PDF
          controller.enqueue(encode({ step: 'extracting', message: 'Lecture du PDF...' }));
          const buffer = Buffer.from(await file.arrayBuffer());
          const text = await extractPdfText(buffer);

          // Step 2: Parse with Claude + clause analysis in parallel
          controller.enqueue(encode({ step: 'analyzing', message: 'Analyse du bail...' }));
          const result = await parseAndAnalyzeWithClaude(text);

          // Step 3: Done
          controller.enqueue(
            encode({
              step: 'done',
              data: result.data,
              confidence: result.confidence,
              clauseIssues: result.clauseIssues,
            })
          );
          controller.close();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Une erreur est survenue.';
        controller.enqueue(encode({ error: message }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
