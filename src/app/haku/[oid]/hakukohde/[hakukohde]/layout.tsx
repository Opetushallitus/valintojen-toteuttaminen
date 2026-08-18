import { Outlet } from 'react-router';
import { Stack } from '@mui/material';
import { HakukohdeTabs } from '../components/hakukohde-tabs';
import { HakukohdeTabWrapper } from './components/hakukohde-tab-wrapper';
import { useRequiredParams } from '@/hooks/useRequiredParams';

export default function HakukohdeTabsLayout() {
  const { oid, hakukohde } = useRequiredParams<{
    oid: string;
    hakukohde: string;
  }>();

  return (
    <Stack
      sx={{
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <HakukohdeTabs hakuOid={oid} hakukohdeOid={hakukohde} />
      <HakukohdeTabWrapper hakuOid={oid} hakukohdeOid={hakukohde}>
        <Outlet />
      </HakukohdeTabWrapper>
    </Stack>
  );
}
