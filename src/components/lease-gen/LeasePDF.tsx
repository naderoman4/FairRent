'use client';

import dynamic from 'next/dynamic';
import type { LeaseGenData } from '@/lib/types-lease-gen';

const PDFContent = dynamic(() => import('./LeasePDFContent'), { ssr: false });

interface Props {
  data: LeaseGenData;
}

export function LeasePDFDownload({ data }: Props) {
  return <PDFContent data={data} />;
}
