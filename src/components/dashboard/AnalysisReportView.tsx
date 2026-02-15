'use client';

import { ComplianceReport } from '@/components/ComplianceReport';
import { LandlordGuidance } from '@/components/dashboard/LandlordGuidance';
import type { ComplianceReport as ReportType } from '@/lib/types';

interface Props {
  report: ReportType;
}

export function AnalysisReportView({ report }: Props) {
  return (
    <div className="space-y-8">
      <ComplianceReport report={report} onReset={() => window.history.back()} />
      <LandlordGuidance issues={report.issues} />
    </div>
  );
}
