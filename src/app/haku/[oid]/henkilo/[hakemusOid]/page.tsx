'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { getHakemukset } from '@/app/lib/ataru';
import { Box, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { useId } from 'react';
import { getHenkiloTitle } from '../lib/henkilo-utils';

const InfoItem = ({ label, value }: { label: string; value: string }) => {
  const labelId = useId();
  return (
    <p>
      <label id={labelId}>{label}</label>:{' '}
      <span aria-labelledby={labelId}>{value}</span>
    </p>
  );
};

export default function ValitseHenkiloPage({
  params,
}: {
  params: { oid: string; hakemusOid: string };
}) {
  const hakuOid = params.oid;
  const hakemusOid = params.hakemusOid;

  const { t } = useTranslations();

  const { data: hakemukset } = useSuspenseQuery({
    queryKey: ['getHakemukset', hakuOid, hakemusOid],
    queryFn: () => getHakemukset({ hakuOid, hakemusOids: [hakemusOid] }),
  });

  const hakemus = hakemukset[0];

  if (!hakemus) {
    notFound();
  }

  return (
    <Box sx={{ m: 4 }}>
      <Typography variant="h2">{getHenkiloTitle(hakemus)}</Typography>
      <InfoItem label={t('henkilo.hakemus-oid')} value={hakemus.hakemusOid} />
      <InfoItem
        label={t('henkilo.lahiosoite')}
        value={`${hakemus.lahiosoite}, ${hakemus.postinumero}`}
      />
    </Box>
  );
}
