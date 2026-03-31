import { Stack } from '@mui/material';
import { HenkiloPanel } from './components/henkilo-panel';
import { ValintojenToteuttaminenAccessGuard } from '../components/valintojen-toteuttaminen-access-guard';

export default async function HenkiloLayout(props: {
  children: React.ReactNode;
  params: Promise<{ oid: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  return (
    <ValintojenToteuttaminenAccessGuard hakuOid={params.oid} tabName="henkilo">
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
        }}
      >
        <HenkiloPanel hakuOid={params.oid} />
        {children}
      </Stack>
    </ValintojenToteuttaminenAccessGuard>
  );
}
