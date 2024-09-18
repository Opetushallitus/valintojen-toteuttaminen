'use client';

import { usePathname } from 'next/navigation';
import { Link as MuiLink } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ophColors, styled } from '@/app/theme';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { useHakukohde } from '@/app/hooks/useHakukohde';
import { useHaku } from '@/app/hooks/useHaku';
import { Haku } from '@/app/lib/types/kouta-types';
import { isKorkeakouluHaku, isToisenAsteenYhteisHaku } from '@/app/lib/kouta';

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

export type BasicTab = {
  title: string;
  route: string;
  visibleFn?: (haku: Haku) => boolean;
};

const TABS: BasicTab[] = [
  { title: 'perustiedot.otsikko', route: 'perustiedot' },
  { title: 'hakeneet.otsikko', route: 'hakeneet' },
  { title: 'valinnanhallinta.otsikko', route: 'valinnan-hallinta' },
  { title: 'valintakoekutsut.otsikko', route: 'valintakoekutsut' },
  { title: 'pistesyotto.otsikko', route: 'pistesyotto' },
  {
    title: 'harkinnanvaraiset.otsikko',
    route: 'harkinnanvaraiset',
    visibleFn: (haku: Haku) => isToisenAsteenYhteisHaku(haku),
  },
  {
    title: 'hakijaryhmat.otsikko',
    route: 'hakijaryhmat',
    visibleFn: (haku: Haku) => isKorkeakouluHaku(haku),
  },
  { title: 'valintalaskennan-tulos.otsikko', route: 'valintalaskennan-tulos' },
  { title: 'sijoittelun-tulokset.otsikko', route: 'sijoittelun-tulokset' },
] as const;

function getPathMatchingTab(pathName: string) {
  const lastPath = pathName.split('/').reverse()[0];
  return TABS.find((tab) => tab.route.startsWith(lastPath)) || TABS[0];
}

export const useHakukohdeTab = () => {
  const pathName = usePathname();
  return getPathMatchingTab(pathName);
};

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
        {TABS.filter((t) => !t.visibleFn || t.visibleFn(haku)).map((tab) => (
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
