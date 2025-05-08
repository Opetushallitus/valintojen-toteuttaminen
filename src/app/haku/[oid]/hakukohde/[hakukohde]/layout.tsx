import { Stack } from '@mui/material';
import { HakukohdeTabs } from '../components/hakukohde-tabs';

export default async function HakuLayout(props: {
  children: React.ReactNode;
  params: Promise<{ oid: string; hakukohde: string }>;
}) {
  const params = await props.params;

  const { children } = props;

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
