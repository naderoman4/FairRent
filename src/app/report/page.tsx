'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ComplianceReport } from '@/components/ComplianceReport';
import type { ComplianceReport as ComplianceReportType } from '@/lib/types';

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<ComplianceReportType | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('fairrent-report');
    if (stored) {
      try {
        setReport(JSON.parse(stored));
      } catch {
        router.push('/analyser');
      }
    } else {
      router.push('/analyser');
    }
  }, [router]);

  const handleReset = () => {
    sessionStorage.removeItem('fairrent-report');
    router.push('/analyser');
  };

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <ComplianceReport report={report} onReset={handleReset} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
