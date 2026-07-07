import { FullClientSpinner } from '@/components/client-spinner';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { Box } from '@mui/material';
import { ValintaryhmaContent } from './components/valintaryhma-content';
import { useRequiredParams } from '@/hooks/useRequiredParams';

export default function ValintaryhmaPage() {
  const params = useRequiredParams<{ oid: string; valintaryhma: string }>();

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
