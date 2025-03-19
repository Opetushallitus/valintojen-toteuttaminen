'use client';

import { ExternalLink } from '@/components/external-link';
import { getValintaryhma } from '@/lib/valintaperusteet/valintaperusteet-service';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTranslations } from '@/lib/localization/useTranslations';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { Stack } from '@mui/material';

export const BasicInfo = ({ hakukohdeOid }: { hakukohdeOid: string }) => {
  const { data: valintaryhma } = useSuspenseQuery({
    queryKey: ['getValintaryhma', hakukohdeOid],
    queryFn: () => getValintaryhma(hakukohdeOid),
  });

  const { t } = useTranslations();

  return (
    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
      <LabeledInfoItem
        label={t('perustiedot.hakukohde-oid')}
        value={hakukohdeOid}
      />
      <LabeledInfoItem
        label={t('perustiedot.valintaryhma')}
        value={
          <ExternalLink
            name={valintaryhma.nimi}
            href={`valintaperusteet-ui/app/index.html#/valintaryhma/${valintaryhma.oid}`}
          />
        }
      />
      <LabeledInfoItem
        label={t('yleinen.lisatiedot')}
        value={
          <Stack direction="row" spacing={3}>
            <ExternalLink
              name={t('perustiedot.valintaperusteet')}
              href={`valintaperusteet-ui/app/index.html#/hakukohde/${hakukohdeOid}`}
            />
            <ExternalLink
              name={t('yleinen.tarjonta')}
              href={`kouta/hakukohde/${hakukohdeOid}`}
            />
          </Stack>
        }
      />
    </Stack>
  );
};
