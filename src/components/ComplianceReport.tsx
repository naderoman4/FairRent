'use client';

import type { ComplianceReport as ReportType } from '@/lib/types';
import { Verdict } from './Verdict';
import { RentComparison } from './RentComparison';
import { IssuesList } from './IssuesList';
import { ActionSteps } from './ActionSteps';
import { ReportPDFDownload } from './ReportPDF';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ComplianceReportProps {
  report: ReportType;
  onReset: () => void;
}

export function ComplianceReport({ report, onReset }: ComplianceReportProps) {
  return (
    <div className="space-y-6">
      <Verdict
        verdict={report.verdict}
        overchargeTotal={report.overchargeTotal}
        issues={report.issues}
      />
      <RentComparison report={report} />
      <IssuesList issues={report.issues} />
      {report.actions.length > 0 && <ActionSteps actions={report.actions} />}

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <ReportPDFDownload report={report} />
        <Button variant="outline" onClick={onReset} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Vérifier un autre bail
        </Button>
      </div>
    </div>
  );
}
