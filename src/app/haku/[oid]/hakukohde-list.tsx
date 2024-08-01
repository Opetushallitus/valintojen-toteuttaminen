'use client';

import { useHakukohdeSearchResults } from '@/app/hooks/useHakukohdeSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { styled } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useHakukohdeTab } from './hakukohde/[hakukohde]/hakukohde-tabs';

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
  const { t, translateEntity } = useTranslations();
  const { results } = useHakukohdeSearchResults(hakuOid);

  const activeHakukohdeTab = useHakukohdeTab();

  const selectHakukohde = (hakukohde: Hakukohde) => {
    router.push(
      `/haku/${hakuOid}/hakukohde/${hakukohde.oid}/${activeHakukohdeTab.route}`,
    );
  };

  const handleHakukohdeKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    hakukohde: Hakukohde,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      selectHakukohde(hakukohde);
    }
  };

  return (
    <StyledList tabIndex={0}>
      <p>
        {results.length} {t('haku.hakukohdetta')}
      </p>
      {results?.map((hk: Hakukohde) => (
        <StyledItem
          key={hk.oid}
          onClick={() => selectHakukohde(hk)}
          onKeyDown={(event) => handleHakukohdeKeyDown(event, hk)}
          tabIndex={0}
        >
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
