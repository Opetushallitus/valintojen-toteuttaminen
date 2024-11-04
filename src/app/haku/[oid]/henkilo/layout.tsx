import { Stack } from '@mui/material';
import HenkiloPanel from './components/henkilo-panel';

export default function HenkiloLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { oid: string };
}) {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'flex-start',
      }}
    >
      <HenkiloPanel hakuOid={params.oid} />
      {children}
    </Stack>
  );
}
