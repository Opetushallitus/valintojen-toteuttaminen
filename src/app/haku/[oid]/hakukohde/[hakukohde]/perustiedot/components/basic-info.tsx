'use client';

import { ExternalLink } from '@/app/components/external-link';
import { getValintaryhma } from '@/app/lib/valintaperusteet/valintaperusteet-service';
import { useSuspenseQuery } from '@tanstack/react-query';
import { styled } from '@mui/material';
import { useTranslations } from '@/app/lib/localization/useTranslations';

const BasicContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(3),
  flexWrap: 'wrap',
  p: {
    marginTop: '0',
  },
}));

const InfoHeader = styled('p')(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
}));

const BasicInfo = ({ hakukohdeOid }: { hakukohdeOid: string }) => {
  const { data: valintaryhma } = useSuspenseQuery({
    queryKey: ['getValintaryhma', hakukohdeOid],
    queryFn: () => getValintaryhma(hakukohdeOid),
  });

  const { t } = useTranslations();

  return (
    <BasicContainer>
      <div>
        <InfoHeader>{t('perustiedot.hakukohde-oid')}</InfoHeader>
        <p>{hakukohdeOid}</p>
      </div>
      <div>
        <InfoHeader>{t('perustiedot.valintaryhma')}</InfoHeader>
        <ExternalLink
          name={valintaryhma.nimi}
          href={`valintaperusteet-ui/app/index.html#/valintaryhma/${valintaryhma.oid}`}
        />
      </div>
      <div>
        <InfoHeader>{t('yleinen.lisatiedot')}</InfoHeader>
        <ExternalLink
          name={t('perustiedot.valintaperusteet')}
          href={`valintaperusteet-ui/app/index.html#/hakukohde/${hakukohdeOid}`}
        />
      </div>
      <div>
        <InfoHeader>&nbsp;</InfoHeader>
        <ExternalLink
          name={t('perustiedot.tarjonta')}
          href={`kouta/hakukohde/${hakukohdeOid}`}
        />
      </div>
    </BasicContainer>
  );
};

export default BasicInfo;
