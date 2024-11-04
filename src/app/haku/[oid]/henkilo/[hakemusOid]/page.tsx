'use client';

import { getHakemukset } from '@/app/lib/ataru';
import { Box, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { getHenkiloTitle } from '../lib/henkilo-utils';
import { useTranslations } from '@/app/hooks/useTranslations';

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
      <Typography variant="h3">{getHenkiloTitle(hakemus)}</Typography>
      <p>
        {t('henkilo.hakemus-oid')}: {hakemus.hakemusOid}
      </p>
      <p>
        {t('henkilo.lahiosoite')}: {hakemus.lahiosoite}, {hakemus.postinumero}
      </p>
    </Box>
  );
}
