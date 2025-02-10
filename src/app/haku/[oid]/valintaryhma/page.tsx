'use client';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { getHakukohteetQueryOptions } from '@/app/lib/kouta';
import { getValintaryhmat } from '@/app/lib/valintaperusteet';
import { Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { use } from 'react';

const ValintaryhmaContent = ({ hakuOid }: { hakuOid: string }) => {
  const { data: userPermissions } = useUserPermissions();
  const { translateEntity } = useTranslations();
  const { data: ryhmat } = useSuspenseQuery({
    queryKey: ['getValintaryhmat', hakuOid],
    queryFn: () => getValintaryhmat(hakuOid),
  });

  const { data: hakukohteet } = useSuspenseQuery(
    getHakukohteetQueryOptions(hakuOid, userPermissions),
  );

  return (
    <>
      {ryhmat.map((ryhma, index) => (
        <div key={`valintaryhma-${index}`}>{ryhma.nimi}</div>
      ))}
      {ryhmat[0].hakukohdeViitteet.map(({ oid }, index) => (
        <div key={`valintaryhma-hakukohde-${index}`}>
          {translateEntity(hakukohteet.find((hk) => hk.oid === oid)!.nimi)}
        </div>
      ))}
    </>
  );
};

export default function ValintaryhmaPage(props: {
  params: Promise<{ oid: string }>;
}) {
  const params = use(props.params);

  return (
    <Box sx={{ padding: 4 }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValintaryhmaContent hakuOid={params.oid} />
      </QuerySuspenseBoundary>
    </Box>
  );
}
