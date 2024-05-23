'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { getHakukohteet } from '@/app/lib/kouta';
import { Hakukohde } from '@/app/lib/kouta-types';
import { styled } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const StyledList = styled('div')({
  maxWidth: '20vw',
  textAlign: 'left',
});

const StyledItem = styled('div')({
  '.organizationLabel': {
    fontWeight: 500,
  },

  '&:nth-of-type(even)': {
    backgroundColor: '#f5f5f5',
  },
  '&:hover': {
    backgroundColor: '#e0f2fd',
  },
});

export const HakukohdeList = ({ oid }: { oid: string }) => {
  const router = useRouter();
  const { translateEntity } = useTranslations();

  const selectHakukohde = (hakukohde: Hakukohde) => {
    router.push(`/haku/${oid}/hakukohde/${hakukohde.oid}/perustiedot`);
  };

  const { data: hakukohteet } = useSuspenseQuery({
    queryKey: ['getHakukohteet', oid],
    queryFn: () => getHakukohteet(oid),
  });

  return (
    <StyledList>
      {hakukohteet.map((hk: Hakukohde) => (
        <StyledItem key={hk.oid} onClick={() => selectHakukohde(hk)}>
          <p title={hk.organisaatioOid} className="organizationLabel">
            {translateEntity(hk.jarjestyspaikkaHierarkiaNimi)}
          </p>
          <p title={hk.oid}>{translateEntity(hk.nimi)}</p>
        </StyledItem>
      ))}
    </StyledList>
  );
};

export default HakukohdeList;
