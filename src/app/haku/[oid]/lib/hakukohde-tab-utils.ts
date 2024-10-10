import {
  isHarkinnanvarainenHakukohde,
  isKorkeakouluHaku,
  isToisenAsteenYhteisHaku,
} from '@/app/lib/kouta';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';

type VisibleFnProps = { haku: Haku; hakukohde: Hakukohde };

export type BasicTab = {
  title: string;
  route: string;
  visibleFn?: (props: VisibleFnProps) => boolean;
};

export const TABS: BasicTab[] = [
  { title: 'perustiedot.otsikko', route: 'perustiedot' },
  { title: 'hakeneet.otsikko', route: 'hakeneet' },
  { title: 'valinnanhallinta.otsikko', route: 'valinnan-hallinta' },
  { title: 'valintakoekutsut.otsikko', route: 'valintakoekutsut' },
  { title: 'pistesyotto.otsikko', route: 'pistesyotto' },
  {
    title: 'harkinnanvaraiset.otsikko',
    route: 'harkinnanvaraiset',
    visibleFn: ({ haku, hakukohde }) =>
      isToisenAsteenYhteisHaku(haku) && isHarkinnanvarainenHakukohde(hakukohde),
  },
  {
    title: 'hakijaryhmat.otsikko',
    route: 'hakijaryhmat',
    visibleFn: ({ haku }) => isKorkeakouluHaku(haku),
  },
  { title: 'valintalaskennan-tulos.otsikko', route: 'valintalaskennan-tulos' },
  { title: 'sijoittelun-tulokset.otsikko', route: 'sijoittelun-tulokset' },
] as const;

export const isTabVisible = ({
  tab,
  haku,
  hakukohde,
}: { tab: BasicTab } & VisibleFnProps) => {
  return !tab.visibleFn || tab.visibleFn({ haku, hakukohde });
};

export const getVisibleTabs = ({ haku, hakukohde }: VisibleFnProps) => {
  return TABS.filter((tab) => isTabVisible({ tab, haku, hakukohde }));
};
