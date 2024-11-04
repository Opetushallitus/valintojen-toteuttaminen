import { Stack } from '@mui/material';
import HakukohdeTabs from '../components/hakukohde-tabs';

export default function HakuLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { oid: string; hakukohde: string };
}) {
  return (
    <Stack
      sx={{
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <HakukohdeTabs hakuOid={params.oid} hakukohdeOid={params.hakukohde} />
      {children}
    </Stack>
  );
}
