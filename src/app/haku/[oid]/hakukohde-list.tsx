'use client';

import { useHakukohdeSearchResults } from '@/app/hooks/useHakukohdeSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakukohde } from '@/app/lib/kouta-types';
import { styled } from '@mui/material';
import { useRouter } from 'next/navigation';

const StyledList = styled('div')({
  width: '100%',
  textAlign: 'left',
  overflowY: 'auto',
  height: '80vh',
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

export const HakukohdeList = ({ hakuOid }: { hakuOid: string }) => {
  const router = useRouter();
  const { translateEntity } = useTranslations();
  const { results } = useHakukohdeSearchResults(hakuOid);

  const selectHakukohde = (hakukohde: Hakukohde) => {
    router.push(`/haku/${hakuOid}/hakukohde/${hakukohde.oid}/perustiedot`);
  };

  return (
    <StyledList tabIndex={0}>
      <p>{results.length} hakukohdetta</p>
      {results?.map((hk: Hakukohde) => (
        <StyledItem key={hk.oid} onClick={() => selectHakukohde(hk)}>
          <p title={hk.organisaatioOid} className="organizationLabel">
            {hk.jarjestyspaikkaHierarkiaNimi
              ? translateEntity(hk.jarjestyspaikkaHierarkiaNimi)
              : ''}
          </p>
          <p title={hk.oid} className="hakukohdeLabel">
            {translateEntity(hk.nimi)}
          </p>
        </StyledItem>
      ))}
    </StyledList>
  );
};

export default HakukohdeList;
