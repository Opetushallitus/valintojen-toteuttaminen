'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { DEFAULT_BOX_BORDER, ophColors, styled } from '@/lib/theme';
import { useHakukohde } from '@/lib/kouta/useHakukohde';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { HakukohdeTabLink } from '@/components/hakukohde-tab-link';
import { useHakukohdeTab } from '@/hooks/useHakukohdeTab';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useVisibleHakukohdeTabs } from '@/hooks/useVisibleHakukohdeTabs';

const StyledContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 3, 0),
  borderBottom: DEFAULT_BOX_BORDER,
}));

const StyledHeader = styled('div')(({ theme }) => ({
  textAlign: 'left',
  marginBottom: theme.spacing(2),
  '& .hakukohdeLabel': {
    fontWeight: 'normal',
  },
}));

const StyledTabs = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1),
  flexWrap: 'wrap',
}));

const StyledTab = styled(HakukohdeTabLink)<{ $active: boolean }>(
  ({ $active }) => ({
    color: ophColors.blue2,
    cursor: 'pointer',
    borderBottom: '3px solid',
    borderColor: $active ? ophColors.blue2 : 'transparent',
    textDecoration: 'none',
    '&:hover': {
      borderColor: ophColors.blue2,
    },
    '&:focus-visible': {
      outlineOffset: '3px',
    },
  }),
);

export const HakukohdeTabs = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const activeTab = useHakukohdeTab();
  const { t, translateEntity } = useTranslations();

  const { data: hakukohde } = useHakukohde({ hakukohdeOid });

  const visibleTabs = useVisibleHakukohdeTabs({ hakuOid, hakukohdeOid });

  return (
    <StyledContainer>
      <StyledHeader>
        <OphTypography variant="h3" component="h2">
          <span className="organisaatioLabel">
            {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
          </span>
          <br />
          <span className="hakukohdeLabel">
            {translateEntity(hakukohde.nimi)}
          </span>
        </OphTypography>
      </StyledHeader>
      <StyledTabs>
        {visibleTabs.map((tab) => (
          <StyledTab
            key={'hakukohde-tab-' + tab.route}
            hakuOid={hakuOid}
            hakukohdeOid={hakukohdeOid}
            tabRoute={tab.route}
            $active={tab.title === activeTab.title}
          >
            {t(tab.title)}
          </StyledTab>
        ))}
      </StyledTabs>
    </StyledContainer>
  );
};
