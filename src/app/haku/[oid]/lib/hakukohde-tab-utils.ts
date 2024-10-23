import {
  isHarkinnanvarainenHakukohde,
  isKorkeakouluHaku,
  isToisenAsteenYhteisHaku,
} from '@/app/lib/kouta';
import { HaunAsetukset } from '@/app/lib/ohjausparametrit';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';

type VisibleFnProps = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
};

export type BasicTab = {
  title: string;
  route: string;
  visibleFn?: (props: VisibleFnProps) => boolean;
};

const plainKoodiUri = (koodiUri: string) => koodiUri.split('#')[0];

const ONLY_VALINNAN_TULOKSET_HAKUTAPA_KOODI_URIS = [
  'hakutapa_02', // Erillishaku
  'hakutapa_03', // Jatkuva haku
  'hakutapa_04', // Joustava haku
  'hakutapa_05', // Lisähaku
  'hakutapa_06', // Siirtohaku
];

const hasOnlyValinnanTulokset = ({
  haku,
  haunAsetukset,
}: Pick<VisibleFnProps, 'haku' | 'haunAsetukset'>) => {
  return (
    ONLY_VALINNAN_TULOKSET_HAKUTAPA_KOODI_URIS.includes(
      plainKoodiUri(haku.hakutapaKoodiUri),
    ) && !haunAsetukset.sijoittelu
  );
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
    visibleFn: ({ haku, haunAsetukset }) =>
      isKorkeakouluHaku(haku) &&
      !hasOnlyValinnanTulokset({ haku, haunAsetukset }),
  },
  {
    title: 'valintalaskennan-tulokset.otsikko',
    route: 'valintalaskennan-tulokset',
    visibleFn: ({ haku, haunAsetukset }) =>
      !hasOnlyValinnanTulokset({ haku, haunAsetukset }),
  },
  {
    title: 'sijoittelun-tulokset.otsikko',
    route: 'sijoittelun-tulokset',
    visibleFn: ({ haku, haunAsetukset }) =>
      !hasOnlyValinnanTulokset({ haku, haunAsetukset }),
  },
  {
    title: 'valinnan-tulokset.otsikko',
    route: 'valinnan-tulokset',
    visibleFn: ({ haku, haunAsetukset }) =>
      hasOnlyValinnanTulokset({ haku, haunAsetukset }),
  },
] as const;

export const isTabVisible = ({
  tab,
  haku,
  hakukohde,
  haunAsetukset,
}: { tab: BasicTab } & VisibleFnProps) => {
  return !tab.visibleFn || tab.visibleFn({ haku, hakukohde, haunAsetukset });
};

export const getVisibleTabs = (visibleProps: VisibleFnProps) => {
  return TABS.filter((tab) => isTabVisible({ tab, ...visibleProps }));
};
