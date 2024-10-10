'use client';

import { useTranslations } from '@/app/hooks/useTranslations';
import { ophColors, styled } from '@/app/lib/theme';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { useHakukohde } from '@/app/hooks/useHakukohde';
import { useHaku } from '@/app/hooks/useHaku';
import { getVisibleTabs } from '@/app/haku/[oid]/lib/hakukohde-tab-utils';
import { useHakukohdeTab } from '@/app/haku/[oid]/hooks/useHakukohdeTab';
import { HakukohdeTabLink } from '@/app/haku/[oid]/components/hakukohde-tab-link';
import { OphTypography } from '@opetushallitus/oph-design-system';

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
    '&:hover,&:focus': {
      borderColor: ophColors.blue2,
    },
  }),
);

const HakukohdeTabs = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const activeTab = useHakukohdeTab();
  const { t, translateEntity } = useTranslations();

  const { data: hakukohde } = useHakukohde({ hakukohdeOid });
  const { data: haku } = useHaku({ hakuOid });

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
        {getVisibleTabs({ haku, hakukohde }).map((tab) => (
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

export default HakukohdeTabs;
