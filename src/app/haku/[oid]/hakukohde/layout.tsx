import { Stack } from '@mui/material';
import { HakukohdePanel } from './components/hakukohde-panel';

export default function HakuLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  params: { oid: string };
}) {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'flex-start',
      }}
    >
      <HakukohdePanel hakuOid={params.oid} />
      {children}
    </Stack>
  );
}
