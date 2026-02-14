// pdf-parse v1 uses CommonJS
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { MIN_TEXT_LENGTH_FOR_OCR } from './constants';

interface PdfParseResult {
  text: string;
  numpages: number;
  info: Record<string, unknown>;
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import for CommonJS module
  const pdfParse = (await import('pdf-parse')).default as (buf: Buffer) => Promise<PdfParseResult>;
  const result = await pdfParse(buffer);
  const text = result.text?.trim() || '';

  if (text.length >= MIN_TEXT_LENGTH_FOR_OCR) {
    return text;
  }

  if (text.length > 0) {
    return text;
  }

  throw new Error(
    'Impossible d\'extraire le texte du PDF. Le fichier est peut-être un scan ou une image. Veuillez remplir le formulaire manuellement.'
  );
}
