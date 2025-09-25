'use client';

import { FullClientSpinner } from '@/components/client-spinner';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box } from '@mui/material';
import SeurantaContent from './components/seuranta-content';

export default function SeurantaPage() {
  return (
    <Box>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <SeurantaContent />
      </QuerySuspenseBoundary>
    </Box>
  );
}
