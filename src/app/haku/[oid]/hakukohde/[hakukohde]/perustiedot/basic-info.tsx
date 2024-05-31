'use client';

import { ExternalLink } from '@/app/components/external-link';
import { getValintaryhma } from '@/app/lib/valintaperusteet';
import { useSuspenseQuery } from '@tanstack/react-query';
import { styled } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

const BasicContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  columnGap: '1.5rem',
  p: {
    marginTop: '0',
  },
});

const InfoHeader = styled('p')({
  fontWeight: 500,
  marginBottom: '0.3rem',
});

const BasicInfo = ({ hakukohdeOid }: { hakukohdeOid: string }) => {
  const { data: valintaryhma } = useSuspenseQuery({
    queryKey: ['getValintaryhma', hakukohdeOid],
    queryFn: () => getValintaryhma(hakukohdeOid),
  });

  const { t } = useTranslations();

  return (
    <BasicContainer>
      <div>
        <InfoHeader>HakukohdeOid</InfoHeader>
        <p>{hakukohdeOid}</p>
      </div>
      <div>
        <InfoHeader>{t('perustiedot.valintaryhma')}</InfoHeader>
        <ExternalLink
          name={valintaryhma.name}
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
