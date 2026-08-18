import { Outlet } from 'react-router';
import { Stack } from '@mui/material';
import { HenkiloPanel } from './components/henkilo-panel';
import { ValintojenToteuttaminenAccessGuard } from '../components/valintojen-toteuttaminen-access-guard';
import { useRequiredParams } from '@/hooks/useRequiredParams';

export default function HenkiloLayout() {
  const { oid } = useRequiredParams<{ oid: string }>();

  return (
    <ValintojenToteuttaminenAccessGuard hakuOid={oid} tabName="henkilo">
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
        }}
      >
        <HenkiloPanel hakuOid={oid} />
        <Outlet />
      </Stack>
    </ValintojenToteuttaminenAccessGuard>
  );
}
