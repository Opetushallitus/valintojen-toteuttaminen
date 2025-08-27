import { Stack } from '@mui/material';
import { HakukohdeTabs } from '../components/hakukohde-tabs';
import { HakukohdeTabWrapper } from './components/hakukohde-tab-wrapper';

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
      <HakukohdeTabWrapper hakuOid={params.oid} hakukohdeOid={params.hakukohde}>
        {children}
      </HakukohdeTabWrapper>
    </Stack>
  );
}
