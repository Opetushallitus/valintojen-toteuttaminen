import { Outlet } from 'react-router';
import { Stack } from '@mui/material';
import { ValintaryhmaPanel } from './components/valintaryhma-panel';
import { useRequiredParams } from '@/hooks/useRequiredParams';

export default function ValintaryhmaLayout() {
  const { oid } = useRequiredParams<{ oid: string }>();

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'flex-start',
      }}
    >
      <ValintaryhmaPanel hakuOid={oid} />
      <Outlet />
    </Stack>
  );
}
