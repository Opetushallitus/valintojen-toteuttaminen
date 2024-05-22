'use client';

import { ExternalLink } from '@/app/components/external-link';
import { getValintaryhma } from '@/app/lib/valintaperusteet';
import { useSuspenseQuery } from '@tanstack/react-query';
import { styled } from '@mui/material';

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

  return (
    <BasicContainer>
      <div>
        <InfoHeader>HakukohdeOid</InfoHeader>
        <p>{hakukohdeOid}</p>
      </div>
      <div>
        <InfoHeader>Valintaryhma</InfoHeader>
        <ExternalLink
          name={valintaryhma.name}
          href={`valintaperusteet-ui/app/index.html#/valintaryhma/${valintaryhma.oid}`}
        />
      </div>
      <div>
        <InfoHeader>Lisätiedot</InfoHeader>
        <ExternalLink
          name="Valintaperusteet"
          href={`valintaperusteet-ui/app/index.html#/hakukohde/${hakukohdeOid}`}
        />
      </div>
      <div>
        <InfoHeader>&nbsp;</InfoHeader>
        <ExternalLink
          name="Tarjonta"
          href={`kouta/hakukohde/${hakukohdeOid}`}
        />
      </div>
    </BasicContainer>
  );
};

export default BasicInfo;
