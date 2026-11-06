import {
  isHarkinnanvarainenHakukohde,
  isKorkeakouluHaku,
  isToisenAsteenYhteisHaku,
} from '@/lib/kouta/kouta-service';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { isValintojenToteuttaminenEstetty } from '@/lib/valintojen-toteuttaminen-access';
import {
  checkHasHakukohdePermission,
  HakukohdePermission,
  HakuPermissions,
} from '@/lib/permissions';
import { isInRange, toFinnishDate } from '@/lib/time-utils';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';

type VisibleFnProps = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
  usesValintalaskenta: boolean;
  hakuPermissions: HakuPermissions;
};

export type BasicTab = {
  title: string;
  route: string;
  visibleFn?: (props: VisibleFnProps) => boolean;
};

const isValinnatAllowedForHaku = (
  haunAsetukset: HaunAsetukset,
  hakuPermissions: HakuPermissions,
) => {
  const estoaika = haunAsetukset?.valinnatEstettyOppilaitosvirkailijoilta;
  const dateStart = estoaika?.dateStart ?? undefined;
  const dateEnd = estoaika?.dateEnd ?? undefined;
  const hasBlockedWindow = dateStart !== undefined || dateEnd !== undefined;
  // Valinnan palvelu estetty oppilaitosvirkailijoilta ajanjaksolla.
  // Opetushallituksen käyttäjillä (hasOphCRUD) on aina pääsy.
  const isEstetty =
    hasBlockedWindow &&
    isInRange(toFinnishDate(new Date()), dateStart, dateEnd);
  return hakuPermissions.userPermissions.hasOphCRUD || !isEstetty;
};

const hasHakukohdePermission = (
  hakukohde: Hakukohde,
  hakuPermissions: HakuPermissions,
  permission: HakukohdePermission,
) => {
  return checkHasHakukohdePermission(hakukohde, hakuPermissions, permission);
};

export const HAKUKOHDE_TABS: ReadonlyArray<BasicTab> = [
  {
    title: 'perustiedot.otsikko',
    route: 'perustiedot',
    visibleFn: ({ hakukohde, hakuPermissions }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'READ'),
  },
  {
    title: 'hakeneet.otsikko',
    route: 'hakeneet',
    visibleFn: ({ hakukohde, haunAsetukset, hakuPermissions }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'READ') &&
      isValinnatAllowedForHaku(haunAsetukset, hakuPermissions),
  },
  {
    title: 'valinnanhallinta.otsikko',
    route: 'valinnan-hallinta',
    visibleFn: ({
      haku,
      hakukohde,
      haunAsetukset,
      hakuPermissions,
      usesValintalaskenta,
    }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'CRUD') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hakuPermissions) &&
      (hakuPermissions.userPermissions.hasOphCRUD ||
        !isToisenAsteenYhteisHaku(haku)),
  },
  {
    title: 'valintakoekutsut.otsikko',
    route: 'valintakoekutsut',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      hakuPermissions,
      usesValintalaskenta,
    }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'READ') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hakuPermissions),
  },
  {
    title: 'pistesyotto.otsikko',
    route: 'pistesyotto',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      hakuPermissions,
      usesValintalaskenta,
    }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'READ_UPDATE') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hakuPermissions),
  },
  {
    title: 'harkinnanvaraiset.otsikko',
    route: 'harkinnanvaraiset',
    visibleFn: ({
      haku,
      hakukohde,
      haunAsetukset,
      hakuPermissions,
      usesValintalaskenta,
    }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'READ') &&
      !isKorkeakouluHaku(haku) &&
      isHarkinnanvarainenHakukohde(hakukohde) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hakuPermissions),
  },
  {
    title: 'hakijaryhmat.otsikko',
    route: 'hakijaryhmat',
    visibleFn: ({
      haku,
      hakukohde,
      haunAsetukset,
      usesValintalaskenta,
      hakuPermissions,
    }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'READ') &&
      isKorkeakouluHaku(haku) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hakuPermissions),
  },
  {
    title: 'valintalaskennan-tulokset.otsikko',
    route: 'valintalaskennan-tulokset',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      usesValintalaskenta,
      hakuPermissions,
    }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'READ') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hakuPermissions),
  },
  {
    title: 'sijoittelun-tulokset.otsikko',
    route: 'sijoittelun-tulokset',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      usesValintalaskenta,
      hakuPermissions,
    }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'READ') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hakuPermissions),
  },
  {
    title: 'valinnan-tulokset.otsikko',
    route: 'valinnan-tulokset',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      usesValintalaskenta,
      hakuPermissions,
    }) =>
      hasHakukohdePermission(hakukohde, hakuPermissions, 'READ') &&
      !usesValintalaskenta &&
      !haunAsetukset.sijoittelu &&
      isValinnatAllowedForHaku(haunAsetukset, hakuPermissions),
  },
] as const;

export const isHakukohdeTabVisible = ({
  tab,
  ...visibleProps
}: { tab: BasicTab } & VisibleFnProps) => {
  return !tab.visibleFn || tab.visibleFn(visibleProps);
};

export const getVisibleHakukohdeTabs = (visibleProps: VisibleFnProps) => {
  if (
    isValintojenToteuttaminenEstetty({
      haku: visibleProps.haku,
      haunAsetukset: visibleProps.haunAsetukset,
      permissions: visibleProps.hakuPermissions.userPermissions,
    })
  ) {
    return [];
  }
  return HAKUKOHDE_TABS.filter((tab) =>
    isHakukohdeTabVisible({ tab, ...visibleProps }),
  );
};
