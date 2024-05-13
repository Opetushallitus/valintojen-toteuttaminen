'use client';

import { getTranslation } from '@/app/lib/common';
import { styled } from '@mui/material';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHakukohde } from '@/app/lib/kouta';
import { usePathname } from 'next/navigation';
import { Link as MuiLink } from '@mui/material';

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
  { title: 'Perustiedot', route: 'perustiedot' },
  { title: 'Hakeneet', route: 'hakeneet' },
  { title: 'Valinnan hallinta', route: 'valinnan-hallinta' },
  { title: 'Valintakoekutsut', route: 'valintakoekutsut' },
  { title: 'Pistesyöttö', route: 'pistesyotto' },
  { title: 'Harkinnanvaraiset', route: 'harkinnanvaraiset' },
  { title: 'Hakijaryhmät', route: 'hakijaryhmat' },
  { title: 'Valintalaskennan tulos', route: 'valintalaskennan-tulos' },
  { title: 'Sijoittelun tulokset', route: 'sijoittelun-tulokset' },
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
            {getTranslation(hakukohde.jarjestyspaikkaHierarkiaNimi)}
          </span>
          <br />
          <span className="hakukohdeLabel">
            {getTranslation(hakukohde.nimi)}
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
            {tab.title}
          </MuiLink>
        ))}
      </StyledTabs>
    </StyledContainer>
  );
};

export default HakukohdeTabs;
