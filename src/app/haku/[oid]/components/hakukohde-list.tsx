'use client';

import { useHakukohdeSearchResults } from '@/app/hooks/useHakukohdeSearch';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import { useParams } from 'next/navigation';
import { useHakukohdeTab } from '../hooks/useHakukohdeTab';
import { styled } from '@/app/lib/theme';
import { HakukohdeTabLink } from './hakukohde-tab-link';

const StyledList = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  textAlign: 'left',
  overflowY: 'auto',
  height: 'auto',
  paddingRight: theme.spacing(0.5),
  gap: theme.spacing(0.5),
}));

const SELECTED_CLASS = 'hakukohde-list--item-selected';

const StyledLinkItem = styled(HakukohdeTabLink)(({ theme }) => ({
  display: 'block',
  padding: theme.spacing(1),
  cursor: 'pointer',
  color: ophColors.blue2,
  textDecoration: 'none',
  '&:nth-of-type(even)': {
    backgroundColor: ophColors.grey50,
  },
  [`&:hover, &:focus, &.${SELECTED_CLASS}`]: {
    backgroundColor: ophColors.lightBlue2,
  },
}));

const useSelectedHakukohdeOid = () => useParams().hakukohde;

export const HakukohdeList = ({ hakuOid }: { hakuOid: string }) => {
  const { t, translateEntity } = useTranslations();
  const { results } = useHakukohdeSearchResults(hakuOid);

  const activeHakukohdeTab = useHakukohdeTab();
  const selectedHakukohdeOid = useSelectedHakukohdeOid();
  return (
    <>
      <OphTypography>
        {results.length} {t('haku.hakukohdetta')}
      </OphTypography>
      <StyledList tabIndex={0} aria-label={t('hakukohde.navigaatio')}>
        {results?.map((hk: Hakukohde) => (
          <StyledLinkItem
            key={hk.oid}
            hakuOid={hakuOid}
            hakukohdeOid={hk.oid}
            tabRoute={activeHakukohdeTab.route}
            className={selectedHakukohdeOid === hk.oid ? SELECTED_CLASS : ''}
            tabIndex={0}
          >
            <OphTypography
              title={hk.organisaatioOid}
              variant="label"
              color="inherit"
            >
              {hk.jarjestyspaikkaHierarkiaNimi
                ? translateEntity(hk.jarjestyspaikkaHierarkiaNimi)
                : ''}
            </OphTypography>
            <OphTypography title={hk.oid} color="inherit">
              {translateEntity(hk.nimi)}
            </OphTypography>
          </StyledLinkItem>
        ))}
      </StyledList>
    </>
  );
};

export default HakukohdeList;
