import { Stack } from '@mui/material';
import { ValintaryhmaPanel } from './components/valintaryhma-panel';

export default async function ValintaryhmaLayout(props: {
  children: React.ReactNode;
  header: React.ReactNode;
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
      <ValintaryhmaPanel hakuOid={params.oid} />
      {children}
    </Stack>
  );
}
