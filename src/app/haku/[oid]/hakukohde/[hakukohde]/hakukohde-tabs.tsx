'use client';

import { getTranslation } from '@/app/lib/common';
import { styled } from '@mui/material';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getHakukohde } from '@/app/lib/kouta';
import { usePathname, useRouter } from 'next/navigation';

const StyledContainer = styled('div')({
  padding: '0.5rem 1.5rem',
  width: '70%',
});

const StyledHeader = styled('div')({
  textAlign: 'left',
  '.hakukohdeLabel': {
    fontWeight: 500,
  },
});

const StyledTabs = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  columnGap: '0.5rem',
  '.hakukohde-tab': {
    cursor: 'pointer',
    '&--active': {
      borderBottom: '2px solid #0a789c',
    },
  },
});

type BasicTab = {
  title: string;
  route: string;
};

const ToinenAsteTabs: BasicTab[] = [
  { title: 'Perustiedot', route: 'perustiedot' },
  { title: 'Hakeneet', route: 'hakeneet' },
  { title: 'Valinnan hallinta', route: 'valinnan-hallinta' },
  { title: 'Valintakoekutsut', route: 'valintakoekutsut' },
  { title: 'Pistesyöttö', route: 'pistesyotto' },
  { title: 'Harkinnanvaraiset', route: 'harkinnanvaraiset' },
  { title: 'Valintalaskennan tulos', route: 'valintalaskennan-tulos' },
  { title: 'Sijoittelun tulokset', route: 'sijoittelun-tulokset' },
];

function getPathMatchingTab(pathName: string) {
  const lastPath = pathName.split('/').reverse()[0];
  return (
    ToinenAsteTabs.find((tab) => tab.route.startsWith(lastPath)) ||
    ToinenAsteTabs[0]
  );
}

export const HakukohdeTabs = ({ hakukohdeOid }: { hakukohdeOid: string }) => {
  const pathName = usePathname();
  const [activeTab, setActiveTab] = useState<BasicTab>(
    getPathMatchingTab(pathName),
  );

  const router = useRouter();

  const { data: hakukohde } = useSuspenseQuery({
    queryKey: ['getHakukohde', hakukohdeOid],
    queryFn: () => getHakukohde(hakukohdeOid),
  });

  const selectActiveTab = (tab: BasicTab) => {
    setActiveTab(tab);
    router.push(`${tab.route}`);
  };

  return (
    <StyledContainer>
      <StyledHeader>
        <p title={hakukohde.organisaatioOid}>
          {getTranslation(hakukohde.jarjestyspaikkaHierarkiaNimi)}
        </p>
        <p className="hakukohdeLabel" title={hakukohde.oid}>
          {getTranslation(hakukohde.nimi)}
        </p>
      </StyledHeader>
      <StyledTabs>
        {ToinenAsteTabs.map((tab, index) => (
          <div
            key={'hakukohde-tab-' + index}
            className={
              tab.title === activeTab.title
                ? 'hakukohde-tab hakukohde-tab--active'
                : 'hakukohde-tab'
            }
            onClick={() => selectActiveTab(tab)}
          >
            {tab.title}
          </div>
        ))}
      </StyledTabs>
    </StyledContainer>
  );
};

export default HakukohdeTabs;
