import { useTranslations } from '@/lib/localization/useTranslations';
import { styled } from '@/lib/theme';
import { Tab, TabRow } from '@/components/Tabs';
import { useHakukohde } from '@/lib/kouta/useHakukohde';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { HakukohdeTabLink } from '@/components/hakukohde-tab-link';
import { useHakukohdeTab } from '@/hooks/useHakukohdeTab';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { useVisibleHakukohdeTabs } from '@/hooks/useVisibleHakukohdeTabs';

// Sivusuuntainen täyte on otsikossa ja välilehtirivillä eikä säiliössä, jotta välilehtirivin
// alla oleva vaakaviiva ulottuu koko leveydelle.
const StyledContainer = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

const StyledHeader = styled('div')(({ theme }) => ({
  textAlign: 'left',
  padding: theme.spacing(0, 3),
  marginBottom: theme.spacing(2),
  '& .hakukohdeLabel': {
    fontWeight: 'normal',
  },
}));

const StyledTabs = styled(TabRow)(({ theme }) => ({
  padding: theme.spacing(0, 3),
}));

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
      <StyledTabs as="nav">
        {visibleTabs.map((tab) => (
          <Tab
            component={HakukohdeTabLink}
            key={'hakukohde-tab-' + tab.route}
            hakuOid={hakuOid}
            hakukohdeOid={hakukohdeOid}
            tabRoute={tab.route}
            aria-current={tab.title === activeTab.title ? 'page' : undefined}
          >
            {t(tab.title)}
          </Tab>
        ))}
      </StyledTabs>
    </StyledContainer>
  );
};
