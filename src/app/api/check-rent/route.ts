import { NextRequest, NextResponse } from 'next/server';
import type { CheckRentRequest, CheckRentResponse } from '@/lib/types';
import { generateReport } from '@/lib/report-generator';

export async function POST(request: NextRequest): Promise<NextResponse<CheckRentResponse>> {
  try {
    const body: CheckRentRequest = await request.json();

    if (!body.leaseData) {
      return NextResponse.json(
        { success: false, error: 'Données du bail manquantes.' },
        { status: 400 }
      );
    }

    const { leaseData, clauseIssues } = body;

    // Basic validation
    if (!leaseData.address || !leaseData.postalCode) {
      return NextResponse.json(
        { success: false, error: 'Adresse et code postal requis.' },
        { status: 400 }
      );
    }

    if (!leaseData.rentExcludingCharges || leaseData.rentExcludingCharges <= 0) {
      return NextResponse.json(
        { success: false, error: 'Le loyer hors charges doit être supérieur à 0.' },
        { status: 400 }
      );
    }

    if (!leaseData.surface || leaseData.surface <= 0) {
      return NextResponse.json(
        { success: false, error: 'La surface doit être supérieure à 0.' },
        { status: 400 }
      );
    }

    if (!leaseData.leaseStartDate) {
      return NextResponse.json(
        { success: false, error: 'La date de début du bail est requise.' },
        { status: 400 }
      );
    }

    const report = await generateReport(leaseData, clauseIssues);

    return NextResponse.json({ success: true, report });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Une erreur interne est survenue.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
