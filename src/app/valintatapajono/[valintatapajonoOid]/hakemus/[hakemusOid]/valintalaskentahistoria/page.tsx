import { FullClientSpinner } from '@/components/client-spinner';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { useRequiredParams } from '@/hooks/useRequiredParams';
import { Stack, Typography } from '@mui/material';

const ValintalaskentahistoriaContent = ({
  valintatapajonoOid,
  hakemusOid,
}: {
  valintatapajonoOid: string;
  hakemusOid: string;
}) => {
  return (
    <Typography>
      {valintatapajonoOid} / {hakemusOid}
    </Typography>
  );
};

export default function ValintalaskentahistoriaPage() {
  const { valintatapajonoOid, hakemusOid } = useRequiredParams<{
    valintatapajonoOid: string;
    hakemusOid: string;
  }>();

  return (
    <Stack spacing={2}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValintalaskentahistoriaContent
          valintatapajonoOid={valintatapajonoOid}
          hakemusOid={hakemusOid}
        />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
