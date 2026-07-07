import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Stack } from '@mui/material';
import { HakukohdePanel } from './components/hakukohde-panel';
import { ValintojenToteuttaminenAccessGuard } from '../components/valintojen-toteuttaminen-access-guard';
import { ClientErrorBoundary } from '@/components/client-error-boundary';
import { FullSpinner } from '@/components/full-spinner';
import { useRequiredParams } from '@/hooks/useRequiredParams';

export default function HakukohdeListLayout() {
  const { oid } = useRequiredParams<{ oid: string }>();

  return (
    <ValintojenToteuttaminenAccessGuard hakuOid={oid} tabName="hakukohde">
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
        }}
      >
        <HakukohdePanel hakuOid={oid} />
        <ClientErrorBoundary>
          <Suspense fallback={<FullSpinner />}>
            <Outlet />
          </Suspense>
        </ClientErrorBoundary>
      </Stack>
    </ValintojenToteuttaminenAccessGuard>
  );
}
