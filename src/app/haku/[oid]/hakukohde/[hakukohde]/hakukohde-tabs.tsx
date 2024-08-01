'use client';

import { styled } from '@mui/material';
import { usePathname } from 'next/navigation';
import { Link as MuiLink } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { colors } from '@/app/theme';
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

const StyledTabs = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  '.hakukohde-tab': {
    cursor: 'pointer',
    '&--active': {
      borderBottom: '3px solid',
      borderColor: colors.blue2,
    },
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
  { title: 'koekutsut.otsikko', route: 'valintakoekutsut' },
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
          <MuiLink
            href={tab.route}
            key={'hakukohde-tab-' + tab.route}
            className={
              tab.title === activeTab.title
                ? 'hakukohde-tab hakukohde-tab--active'
                : 'hakukohde-tab'
            }
          >
            {t(tab.title)}
          </MuiLink>
        ))}
      </StyledTabs>
    </StyledContainer>
  );
};

export default HakukohdeTabs;
