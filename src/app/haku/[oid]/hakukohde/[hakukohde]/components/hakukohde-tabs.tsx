'use client';

import { Link as MuiLink } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ophColors, styled } from '@/app/lib/theme';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { useHakukohde } from '@/app/hooks/useHakukohde';
import { useHaku } from '@/app/hooks/useHaku';
import { getVisibleTabs } from '@/app/haku/[oid]/lib/hakukohde-tab-utils';
import { useHakukohdeTab } from '@/app/haku/[oid]/hooks/useHakukohdeTab';

const StyledContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2, 3, 0),
  borderBottom: DEFAULT_BOX_BORDER,
}));

const StyledHeader = styled('div')({
  textAlign: 'left',
});

const StyledTabs = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
}));

const StyledTab = styled(MuiLink)<{ $active: boolean }>(({ $active }) => ({
  color: ophColors.blue2,
  cursor: 'pointer',
  borderBottom: '3px solid',
  borderColor: $active ? ophColors.blue2 : 'transparent',
  '&:hover,&:focus': {
    textDecoration: 'none',
    borderColor: ophColors.blue2,
  },
}));

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
        <h2>
          <span className="organisaatioLabel">
            {translateEntity(hakukohde.jarjestyspaikkaHierarkiaNimi)}
          </span>
          <br />
          <span className="hakukohdeLabel">
            {translateEntity(hakukohde.nimi)}
          </span>
        </h2>
      </StyledHeader>
      <StyledTabs>
        {getVisibleTabs({ haku, hakukohde }).map((tab) => (
          <StyledTab
            href={tab.route}
            key={'hakukohde-tab-' + tab.route}
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
