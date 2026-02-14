import { NextRequest } from 'next/server';
import { extractPdfText } from '@/lib/pdf-extractor';
import { parseLeaseWithClaude } from '@/lib/lease-parser';
import { checkRateLimit } from '@/lib/rate-limit';
import { MAX_PDF_SIZE_BYTES } from '@/lib/constants';

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

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Parse multipart form data
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

        // Step 1: Extract text
        controller.enqueue(encode({ step: 'extracting', message: 'Lecture du PDF...' }));
        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await extractPdfText(buffer);

        // Step 2: Parse with Claude
        controller.enqueue(encode({ step: 'parsing', message: 'Analyse du bail...' }));
        const result = await parseLeaseWithClaude(text);

        // Step 3: Done
        controller.enqueue(
          encode({
            step: 'done',
            data: result.data,
            confidence: result.confidence,
          })
        );
        controller.close();
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
