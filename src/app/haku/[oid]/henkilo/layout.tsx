import { Stack } from '@mui/material';
import { HenkiloPanel } from './components/henkilo-panel';

export default async function HenkiloLayout(props: {
  children: React.ReactNode;
  params: Promise<{ oid: string }>;
}) {
  const params = await props.params;

  const { children } = props;

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
