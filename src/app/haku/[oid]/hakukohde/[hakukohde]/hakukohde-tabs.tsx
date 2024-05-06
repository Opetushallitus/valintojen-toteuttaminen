'use client';

import { getTranslation } from '@/app/lib/common';
import { Hakukohde } from '@/app/lib/kouta-types';
import { styled } from '@mui/material';
import { useState } from 'react';
import PerustiedotTab from './perustiedot-tab';
import HakeneetTab from './hakeneet-tab';
import ValinnanHallintaTab from './valinnan-hallinta-tab';
import KoekutsutTab from './koekutsut-tab';
import PistesyottoTab from './pistesyotto-tab';
import HarkinnanvaraisetTab from './harkinnanvaraiset-tab';
import LaskennanTulosTab from './laskennan-tulos-tab';
import SijoittelunTulosTab from './sijoittelun-tulos-tab';

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
  tab: ({ hakukohde }: { hakukohde: Hakukohde }) => JSX.Element;
  title: string;
};

const ToinenAsteTabs: BasicTab[] = [
  { tab: PerustiedotTab, title: 'Perustiedot' },
  { tab: HakeneetTab, title: 'Hakeneet' },
  { tab: ValinnanHallintaTab, title: 'Valinnan hallinta' },
  { tab: KoekutsutTab, title: 'Valintakoekutsut' },
  { tab: PistesyottoTab, title: 'Pistesyöttö' },
  { tab: HarkinnanvaraisetTab, title: 'Harkinnanvaraiset' },
  { tab: LaskennanTulosTab, title: 'Valintalaskennan tulos' },
  { tab: SijoittelunTulosTab, title: 'Sijoittelun tulokset' },
];

export const HakukohdeTabs = ({ hakukohde }: { hakukohde: Hakukohde }) => {
  const [activeTab, setActiveTab] = useState<BasicTab>(ToinenAsteTabs[0]);

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
            onClick={() => setActiveTab(tab)}
          >
            {tab.title}
          </div>
        ))}
      </StyledTabs>
      {activeTab.tab({ hakukohde: hakukohde })}
    </StyledContainer>
  );
};

export default HakukohdeTabs;
