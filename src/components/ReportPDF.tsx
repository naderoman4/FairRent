'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { ComplianceReport } from '@/lib/types';

// Dynamically import react-pdf to avoid SSR issues
const PDFContent = dynamic(() => import('./ReportPDFContent'), { ssr: false });

interface ReportPDFDownloadProps {
  report: ComplianceReport;
}

export function ReportPDFDownload({ report }: ReportPDFDownloadProps) {
  return <PDFContent report={report} />;
}
