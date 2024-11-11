'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { buildLinkToApplication, getHakemukset } from '@/app/lib/ataru';
import { Box, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { getHenkiloTitle } from '../lib/henkilo-utils';
import { LabeledInfoItem } from '@/app/components/labeled-info-item';
import { ExternalLink } from '@/app/components/external-link';
import { getPostitoimipaikka } from '@/app/lib/koodisto';

export default function ValitseHenkiloPage({
  params,
}: {
  params: { oid: string; hakemusOid: string };
}) {
  const hakuOid = params.oid;
  const hakemusOid = params.hakemusOid;

  const { t, translateEntity } = useTranslations();

  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['getHakemukset', hakuOid, hakemusOid],
    queryFn: () => getHakemukset({ hakuOid, hakemusOids: [hakemusOid] }),
  });

  const hakemus = hakemukset[0];

  if (!hakemus) {
    notFound();
  }

  const { data: postitoimipaikka } = useSuspenseQuery({
    queryKey: ['getPostitoimipaikka', hakemus.postinumero],
    queryFn: () => getPostitoimipaikka(hakemus.postinumero),
  });

  return (
    <Box sx={{ m: 4 }}>
      <Typography variant="h2" sx={{ mb: 3 }}>
        {getHenkiloTitle(hakemus)}
      </Typography>
      <Stack direction="row" spacing="4vw">
        <LabeledInfoItem
          label={t('henkilo.hakemus-oid')}
          value={
            <ExternalLink
              name={hakemus.hakemusOid}
              href={buildLinkToApplication(hakemus.hakemusOid)}
              noIcon={true}
            />
          }
        />
        <LabeledInfoItem
          label={t('henkilo.lahiosoite')}
          value={`${hakemus.lahiosoite}, ${hakemus.postinumero} ${translateEntity(postitoimipaikka)}`}
        />
      </Stack>
    </Box>
  );
}
