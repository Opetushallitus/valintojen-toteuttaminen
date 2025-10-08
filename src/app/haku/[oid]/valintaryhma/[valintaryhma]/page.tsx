'use client';
import { FullClientSpinner } from '@/components/client-spinner';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box } from '@mui/material';
import { use } from 'react';
import { ValintaryhmaContent } from './components/valintaryhma-content';

export default function ValintaryhmaPage(props: {
  params: Promise<{ oid: string; valintaryhma: string }>;
}) {
  const params = use(props.params);

  return (
    <Box sx={{ padding: 4, width: '100%' }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValintaryhmaContent
          hakuOid={params.oid}
          valintaryhmaOid={params.valintaryhma}
        />
      </QuerySuspenseBoundary>
    </Box>
  );
}
