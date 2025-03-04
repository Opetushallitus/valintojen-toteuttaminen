'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { buildLinkToApplication } from '@/lib/ataru/ataru-service';
import { Stack, Typography } from '@mui/material';
import { getHenkiloTitle } from '@/lib/henkilo-utils';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { ExternalLink } from '@/components/external-link';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { HakutoiveetTable } from './components/hakutoiveet-table';
import { useHenkiloPageData } from './hooks/useHenkiloPageData';
import { use } from 'react';
import { HenkilonPistesyotto } from './components/henkilon-pistesyotto';
import { useHaunAsetukset } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { useHaku } from '@/lib/kouta/useHaku';
import { HenkilonValintalaskenta } from './components/henkilon-valintalaskenta';

const HenkiloContent = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const { t, translateEntity } = useTranslations();

  const { data: haku } = useHaku({ hakuOid });
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid });

  const { hakukohteet, hakija, postitoimipaikka } = useHenkiloPageData({
    hakuOid,
    hakemusOid,
  });

  return (
    <>
      <Typography variant="h2">{getHenkiloTitle(hakija)}</Typography>
      <HenkilonValintalaskenta
        hakukohteet={hakukohteet}
        haku={haku}
        haunAsetukset={haunAsetukset}
      />
      <Stack direction="row" spacing="4vw" sx={{ paddingTop: 1 }}>
        <LabeledInfoItem
          label={t('henkilo.hakemus-oid')}
          value={
            <ExternalLink
              name={hakija.hakemusOid}
              href={buildLinkToApplication(hakija.hakemusOid)}
              noIcon={true}
            />
          }
        />
        <LabeledInfoItem
          label={t('henkilo.lahiosoite')}
          value={`${hakija.lahiosoite}, ${hakija.postinumero} ${translateEntity(postitoimipaikka)}`}
        />
      </Stack>
      <HakutoiveetTable hakukohteet={hakukohteet} hakija={hakija} />
      <HenkilonPistesyotto hakija={hakija} hakukohteet={hakukohteet} />
    </>
  );
};

export default function HenkiloPage(props: {
  params: Promise<{ oid: string; hakemusOid: string }>;
}) {
  const params = use(props.params);
  const hakuOid = params.oid;
  const hakemusOid = params.hakemusOid;

  return (
    <Stack spacing={2} sx={{ margin: 4, width: '100%', overflowX: 'hidden' }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HenkiloContent hakuOid={hakuOid} hakemusOid={hakemusOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
