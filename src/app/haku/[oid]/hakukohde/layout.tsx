import { Stack } from '@mui/material';
import { HakukohdePanel } from './components/hakukohde-panel';
import { ValintojenToteuttaminenAccessGuard } from '../components/valintojen-toteuttaminen-access-guard';

export default async function HakuLayout(props: {
  children: React.ReactNode;
  header: React.ReactNode;
  params: Promise<{ oid: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  return (
    <ValintojenToteuttaminenAccessGuard
      hakuOid={params.oid}
      tabName="hakukohde"
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
        }}
      >
        <HakukohdePanel hakuOid={params.oid} />
        {children}
      </Stack>
    </ValintojenToteuttaminenAccessGuard>
  );
}
