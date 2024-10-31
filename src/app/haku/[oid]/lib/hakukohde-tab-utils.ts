import {
  isHarkinnanvarainenHakukohde,
  isKorkeakouluHaku,
} from '@/app/lib/kouta';
import { HaunAsetukset } from '@/app/lib/types/haun-asetukset';
import { UserPermissions } from '@/app/lib/permissions';
import { isInRange, toFinnishDate } from '@/app/lib/time-utils';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';

type VisibleFnProps = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
  usesValintalaskenta: boolean;
  permissions: UserPermissions;
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
    !haunAsetukset.sijoittelu &&
    ONLY_VALINNAN_TULOKSET_HAKUTAPA_KOODI_URIS.includes(
      plainKoodiUri(haku.hakutapaKoodiUri),
    )
  );
};

const isAllowedToUseValinnat = (
  haunAsetukset: HaunAsetukset,
  permissions: UserPermissions,
) => {
  return (
    permissions.admin ||
    isInRange(
      toFinnishDate(new Date()),
      haunAsetukset?.PH_OLVVPKE?.dateStart,
      haunAsetukset?.PH_OLVVPKE?.dateEnd,
    )
  );
};

export const TABS: BasicTab[] = [
  { title: 'perustiedot.otsikko', route: 'perustiedot' },
  {
    title: 'hakeneet.otsikko',
    route: 'hakeneet',
    visibleFn: ({ haunAsetukset, permissions }) =>
      isAllowedToUseValinnat(haunAsetukset, permissions),
  },
  {
    title: 'valinnanhallinta.otsikko',
    route: 'valinnan-hallinta',
    visibleFn: ({ haunAsetukset, permissions }) =>
      isAllowedToUseValinnat(haunAsetukset, permissions),
  },
  {
    title: 'valintakoekutsut.otsikko',
    route: 'valintakoekutsut',
    visibleFn: ({ haunAsetukset, permissions }) =>
      isAllowedToUseValinnat(haunAsetukset, permissions),
  },
  {
    title: 'pistesyotto.otsikko',
    route: 'pistesyotto',
    visibleFn: ({ haunAsetukset, permissions }) =>
      isAllowedToUseValinnat(haunAsetukset, permissions),
  },
  {
    title: 'harkinnanvaraiset.otsikko',
    route: 'harkinnanvaraiset',
    visibleFn: ({ haku, hakukohde, haunAsetukset, permissions }) =>
      !isKorkeakouluHaku(haku) &&
      isHarkinnanvarainenHakukohde(hakukohde) &&
      isAllowedToUseValinnat(haunAsetukset, permissions),
  },
  {
    title: 'hakijaryhmat.otsikko',
    route: 'hakijaryhmat',
    visibleFn: ({ haku, haunAsetukset, usesValintalaskenta, permissions }) =>
      isKorkeakouluHaku(haku) &&
      (!hasOnlyValinnanTulokset({ haku, haunAsetukset }) ||
        usesValintalaskenta) &&
      isAllowedToUseValinnat(haunAsetukset, permissions),
  },
  {
    title: 'valintalaskennan-tulokset.otsikko',
    route: 'valintalaskennan-tulokset',
    visibleFn: ({ haku, haunAsetukset, usesValintalaskenta, permissions }) =>
      (!hasOnlyValinnanTulokset({ haku, haunAsetukset }) ||
        usesValintalaskenta) &&
      isAllowedToUseValinnat(haunAsetukset, permissions),
  },
  {
    title: 'sijoittelun-tulokset.otsikko',
    route: 'sijoittelun-tulokset',
    visibleFn: ({ haku, haunAsetukset, usesValintalaskenta, permissions }) =>
      (!hasOnlyValinnanTulokset({ haku, haunAsetukset }) ||
        usesValintalaskenta) &&
      isAllowedToUseValinnat(haunAsetukset, permissions),
  },
  {
    title: 'valinnan-tulokset.otsikko',
    route: 'valinnan-tulokset',
    visibleFn: ({ haku, haunAsetukset, usesValintalaskenta, permissions }) =>
      hasOnlyValinnanTulokset({ haku, haunAsetukset }) &&
      !usesValintalaskenta &&
      isAllowedToUseValinnat(haunAsetukset, permissions),
  },
] as const;

export const isTabVisible = ({
  tab,
  ...visibleProps
}: { tab: BasicTab } & VisibleFnProps) => {
  return !tab.visibleFn || tab.visibleFn(visibleProps);
};

export const getVisibleTabs = (visibleProps: VisibleFnProps) => {
  return TABS.filter((tab) => isTabVisible({ tab, ...visibleProps }));
};
