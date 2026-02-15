'use client';

import { useState } from 'react';
import type { LeaseData, ComplianceIssue } from '@/lib/types';
import { MAX_CLAUSE_TEXT_LENGTH } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, ClipboardPaste } from 'lucide-react';

interface CopyPasteInputProps {
  onComplete: (data: Partial<LeaseData>, confidence: Record<string, number>, clauseIssues?: ComplianceIssue[]) => void;
  onError: (message: string) => void;
  onBack: () => void;
}

export function CopyPasteInput({ onComplete, onError, onBack }: CopyPasteInputProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim()) {
      onError('Veuillez coller le texte de votre bail.');
      return;
    }

    setLoading(true);
    setStep('analyzing');

    try {
      const response = await fetch('/api/parse-lease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), mode: 'full' }),
      });

      const reader = response.body?.getReader();
      if (!reader) {
        onError('Erreur de connexion.');
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed);
            if (event.step === 'analyzing') {
              setStep('analyzing');
            } else if (event.step === 'done' && event.data) {
              onComplete(event.data, event.confidence || {}, event.clauseIssues);
              return;
            } else if (event.error) {
              onError(event.error);
              setLoading(false);
              return;
            }
          } catch {
            // skip
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer.trim());
          if (event.step === 'done' && event.data) {
            onComplete(event.data, event.confidence || {}, event.clauseIssues);
            return;
          } else if (event.error) {
            onError(event.error);
          }
        } catch {
          // ignore
        }
      }
    } catch {
      onError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold">Coller le texte du bail</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardPaste className="h-5 w-5" />
            Texte du bail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Copiez-collez le contenu de votre bail ci-dessous. Nous extrairons automatiquement
            les informations et analyserons les clauses.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            maxLength={MAX_CLAUSE_TEXT_LENGTH}
            placeholder="Collez ici le texte de votre bail..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            disabled={loading}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {text.length.toLocaleString()} / {MAX_CLAUSE_TEXT_LENGTH.toLocaleString()} caractères
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <Shield className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Le texte est analysé uniquement pour cette vérification et n&apos;est pas conservé.
            </span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleAnalyze} disabled={loading || !text.trim()} size="lg" className="w-full">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            {step === 'analyzing' ? 'Analyse en cours...' : 'Traitement...'}
          </span>
        ) : (
          'Analyser mon bail'
        )}
      </Button>
    </div>
  );
}
