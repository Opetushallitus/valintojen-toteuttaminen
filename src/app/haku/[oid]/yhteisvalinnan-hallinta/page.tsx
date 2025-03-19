'use client';
import { FullClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { buildLinkToHaku } from '@/lib/ataru/ataru-service';
import { configuration } from '@/lib/configuration';
import { useHaku } from '@/lib/kouta/useHaku';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Stack } from '@mui/material';
import { use } from 'react';

const YhteisvalinnanHallintaContent = ({ hakuOid }: { hakuOid: string }) => {
  const { data: haku } = useHaku({ hakuOid });

  const { t, translateEntity } = useTranslations();

  return (
    <Stack direction="row" spacing="4vw" sx={{ paddingTop: 1 }}>
      <LabeledInfoItem
        label={t('yleinen.haku')}
        value={translateEntity(haku.nimi)}
      />
      <LabeledInfoItem label={t('yleinen.haun-tunniste')} value={haku.oid} />
      <LabeledInfoItem
        label={t('yleinen.lisatiedot')}
        value={
          <Stack direction="row" spacing={3}>
            <ExternalLink
              name={t('yleinen.haun-asetukset')}
              href={configuration.haunAsetuksetLinkUrl({ hakuOid: haku.oid })}
            />
            <ExternalLink
              name={t('yleinen.tarjonta')}
              href={buildLinkToHaku(haku.oid)}
            />
          </Stack>
        }
      />
    </Stack>
  );
};

export default function YhteisvalinnanHallintaPage(props: {
  params: Promise<{ oid: string }>;
}) {
  const params = use(props.params);
  const hakuOid = params.oid;

  return (
    <Stack spacing={2} sx={{ margin: 4, width: '100%', overflowX: 'hidden' }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <YhteisvalinnanHallintaContent hakuOid={hakuOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
