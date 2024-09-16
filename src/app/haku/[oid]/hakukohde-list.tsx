'use client';

import { useHakukohdeSearchResults } from '@/app/hooks/useHakukohdeSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { Link, styled } from '@mui/material';
import { useHakukohdeTab } from './hakukohde/[hakukohde]/hakukohde-tabs';
import { colors, Typography } from '@opetushallitus/oph-design-system';
import { useParams } from 'next/navigation';

const StyledList = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  textAlign: 'left',
  overflowY: 'auto',
  height: '80vh',
  gap: theme.spacing(0.5),
}));

const SELECTED_CLASS = 'hakukohde-list--item-selected';

const StyledItem = styled(Link)(({ theme }) => ({
  display: 'block',
  padding: theme.spacing(1),
  textDecoration: 'none',
  cursor: 'pointer',
  color: colors.blue2,
  '&:nth-of-type(even)': {
    backgroundColor: colors.grey50,
  },
  [`&:hover, &.${SELECTED_CLASS}`]: {
    backgroundColor: colors.lightBlue2,
  },
}));

const useSelectedHakukohdeOid = () => useParams().hakukohde;

export const HakukohdeList = ({ hakuOid }: { hakuOid: string }) => {
  const { t, translateEntity } = useTranslations();
  const { results } = useHakukohdeSearchResults(hakuOid);

  const activeHakukohdeTab = useHakukohdeTab();
  const selectedHakukohdeOid = useSelectedHakukohdeOid();
  return (
    <StyledList tabIndex={0}>
      <Typography>
        {results.length} {t('haku.hakukohdetta')}
      </Typography>
      {results?.map((hk: Hakukohde) => (
        <StyledItem
          key={hk.oid}
          className={selectedHakukohdeOid === hk.oid ? SELECTED_CLASS : ''}
          href={`/haku/${hakuOid}/hakukohde/${hk.oid}/${activeHakukohdeTab.route}`}
          tabIndex={0}
        >
          <Typography
            title={hk.organisaatioOid}
            variant="label"
            color="inherit"
          >
            {hk.jarjestyspaikkaHierarkiaNimi
              ? translateEntity(hk.jarjestyspaikkaHierarkiaNimi)
              : ''}
          </Typography>
          <Typography title={hk.oid} color="inherit">
            {translateEntity(hk.nimi)}
          </Typography>
        </StyledItem>
      ))}
    </StyledList>
  );
};

export default HakukohdeList;
