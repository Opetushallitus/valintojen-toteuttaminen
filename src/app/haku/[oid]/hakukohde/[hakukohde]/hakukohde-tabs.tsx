'use client';

import { styled } from '@mui/material';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHakukohde } from '@/app/lib/kouta';
import { usePathname } from 'next/navigation';
import { Link as MuiLink } from '@mui/material';
import { useUserLanguage } from '@/app/hooks/useAsiointiKieli';
import { translateName } from '@/app/lib/localization/translation-utils';
import { useTranslation } from 'react-i18next';

const StyledContainer = styled('div')({
  padding: '0.5rem 1.5rem 0',
  width: '100%',
  border: '1px solid lightgray',
});

const StyledHeader = styled('div')({
  textAlign: 'left',
  h2: {},
  '.hakukohdeLabel': {
    fontWeight: 600,
  },
  '.organisaatioLabel': {
    fontWeight: 'normal',
  },
});

const StyledTabs = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  columnGap: '0.5rem',
  '.hakukohde-tab': {
    cursor: 'pointer',
    '&--active': {
      borderBottom: '3px solid #0a789c',
    },
  },
});

export type BasicTab = {
  title: string;
  route: string;
};

const TABS: BasicTab[] = [
  { title: 'perustiedot.title', route: 'perustiedot' },
  { title: 'hakeneet.title', route: 'hakeneet' },
  { title: 'valinnanhallinta.title', route: 'valinnan-hallinta' },
  { title: 'koekutsut.title', route: 'valintakoekutsut' },
  { title: 'pistesyotto.title', route: 'pistesyotto' },
  { title: 'harkinnanvaraiset.title', route: 'harkinnanvaraiset' },
  { title: 'hakijaryhmat.title', route: 'hakijaryhmat' },
  { title: 'valintalaskennantulos.title', route: 'valintalaskennan-tulos' },
  { title: 'sijoitteluntulokset.title', route: 'sijoittelun-tulokset' },
] as const;

function getPathMatchingTab(pathName: string) {
  const lastPath = pathName.split('/').reverse()[0];
  return TABS.find((tab) => tab.route.startsWith(lastPath)) || TABS[0];
}

export const HakukohdeTabs = ({ hakukohdeOid }: { hakukohdeOid: string }) => {
  const pathName = usePathname();
  const [activeTab, setActiveTab] = useState<BasicTab>(
    getPathMatchingTab(pathName),
  );
  const userLanguage = useUserLanguage();
  const { t } = useTranslation();

  const { data: hakukohde } = useSuspenseQuery({
    queryKey: ['getHakukohde', hakukohdeOid],
    queryFn: () => getHakukohde(hakukohdeOid),
  });

  const selectActiveTab = (tab: BasicTab) => {
    setActiveTab(tab);
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <h2>
          <span className="organisaatioLabel">
            {translateName(
              hakukohde.jarjestyspaikkaHierarkiaNimi,
              userLanguage,
            )}
          </span>
          <br />
          <span className="hakukohdeLabel">
            {translateName(hakukohde.nimi, userLanguage)}
          </span>
        </h2>
      </StyledHeader>
      <StyledTabs>
        {TABS.map((tab) => (
          <MuiLink
            href={tab.route}
            key={'hakukohde-tab-' + tab.route}
            className={
              tab.title === activeTab.title
                ? 'hakukohde-tab hakukohde-tab--active'
                : 'hakukohde-tab'
            }
            onClick={() => selectActiveTab(tab)}
          >
            {t(tab.title)}
          </MuiLink>
        ))}
      </StyledTabs>
    </StyledContainer>
  );
};

export default HakukohdeTabs;
