'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import type { LeaseData, ComplianceIssue } from '@/lib/types';
import { MAX_PDF_SIZE_BYTES } from '@/lib/constants';

interface LeaseUploadProps {
  onProgress: (step: string) => void;
  onComplete: (data: Partial<LeaseData>, confidence: Record<string, number>, clauseIssues?: ComplianceIssue[]) => void;
  onError: (message: string) => void;
}

export function LeaseUpload({ onProgress, onComplete, onError }: LeaseUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      onError('Veuillez sélectionner un fichier PDF.');
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      onError('Le fichier dépasse la limite de 20 Mo.');
      return;
    }

    onProgress('extracting');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-lease', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok && !response.body) {
        const err = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        onError(err.error || `Erreur ${response.status}`);
        return;
      }

      if (response.body) {
        const reader = response.body.getReader();
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
              if (event.step === 'extracting' || event.step === 'parsing' || event.step === 'analyzing') {
                onProgress(event.step);
              } else if (event.step === 'done' && event.data) {
                onComplete(event.data, event.confidence || {}, event.clauseIssues);
                return;
              } else if (event.error) {
                onError(event.error);
                return;
              }
            } catch {
              // Skip malformed lines
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
              return;
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      onError('Erreur de connexion. Veuillez réessayer.');
    }
  }, [onProgress, onComplete, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        relative cursor-pointer border-2 border-dashed rounded-2xl p-10
        transition-colors duration-200
        ${isDragging
          ? 'border-primary bg-blue-50'
          : 'border-gray-300 hover:border-primary hover:bg-blue-50/50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
          {isDragging ? (
            <FileText className="h-7 w-7 text-primary" />
          ) : (
            <Upload className="h-7 w-7 text-primary" />
          )}
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900">
            {isDragging ? 'Déposez votre fichier' : 'Glissez votre bail ici'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ou <span className="text-primary underline">parcourez vos fichiers</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">PDF uniquement — 20 Mo max</p>
        </div>
      </div>
    </div>
  );
}
