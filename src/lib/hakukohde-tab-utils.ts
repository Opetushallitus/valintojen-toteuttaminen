import {
  isHarkinnanvarainenHakukohde,
  isKorkeakouluHaku,
} from '@/lib/kouta/kouta-service';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { Permission, UserPermissions } from '@/lib/permissions';
import { isInRange, toFinnishDate } from '@/lib/time-utils';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import {
  checkHasSomeOrganizationPermission,
  selectOrganizationsOidsByPermission,
} from '@/hooks/useUserPermissions';

type VisibleFnProps = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
  usesValintalaskenta: boolean;
  hierarchyPermissions: UserPermissions;
};

export type BasicTab = {
  title: string;
  route: string;
  visibleFn?: (props: VisibleFnProps) => boolean;
};

const isValinnatAllowedForHaku = (
  haunAsetukset: HaunAsetukset,
  hierarchyPermissions: UserPermissions,
) => {
  return (
    hierarchyPermissions.hasOphCRUD ||
    isInRange(
      toFinnishDate(new Date()),
      haunAsetukset?.valinnatEstettyOppilaitosvirkailijoilta?.dateStart,
      haunAsetukset?.valinnatEstettyOppilaitosvirkailijoilta?.dateEnd,
    )
  );
};

const hasHierarchyPermission = (
  hakukohde: Hakukohde,
  hierarchyPermissions: UserPermissions,
  permission: Permission,
) => {
  const permissionOrganizationOids = selectOrganizationsOidsByPermission(
    hierarchyPermissions,
    permission,
  );

  return checkHasSomeOrganizationPermission(
    hakukohde.tarjoajaOid,
    permissionOrganizationOids,
  );
};

export const TABS: Array<BasicTab> = [
  {
    title: 'perustiedot.otsikko',
    route: 'perustiedot',
    visibleFn: ({ hakukohde, hierarchyPermissions }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'READ'),
  },
  {
    title: 'hakeneet.otsikko',
    route: 'hakeneet',
    visibleFn: ({ hakukohde, haunAsetukset, hierarchyPermissions }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'READ') &&
      isValinnatAllowedForHaku(haunAsetukset, hierarchyPermissions),
  },
  {
    title: 'valinnanhallinta.otsikko',
    route: 'valinnan-hallinta',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      hierarchyPermissions,
      usesValintalaskenta,
    }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'CRUD') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hierarchyPermissions),
  },
  {
    title: 'valintakoekutsut.otsikko',
    route: 'valintakoekutsut',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      hierarchyPermissions,
      usesValintalaskenta,
    }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'READ') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hierarchyPermissions),
  },
  {
    title: 'pistesyotto.otsikko',
    route: 'pistesyotto',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      hierarchyPermissions,
      usesValintalaskenta,
    }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'READ_UPDATE') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hierarchyPermissions),
  },
  {
    title: 'harkinnanvaraiset.otsikko',
    route: 'harkinnanvaraiset',
    visibleFn: ({
      haku,
      hakukohde,
      haunAsetukset,
      hierarchyPermissions,
      usesValintalaskenta,
    }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'READ') &&
      !isKorkeakouluHaku(haku) &&
      isHarkinnanvarainenHakukohde(hakukohde) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hierarchyPermissions),
  },
  {
    title: 'hakijaryhmat.otsikko',
    route: 'hakijaryhmat',
    visibleFn: ({
      haku,
      hakukohde,
      haunAsetukset,
      usesValintalaskenta,
      hierarchyPermissions,
    }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'READ') &&
      isKorkeakouluHaku(haku) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hierarchyPermissions),
  },
  {
    title: 'valintalaskennan-tulokset.otsikko',
    route: 'valintalaskennan-tulokset',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      usesValintalaskenta,
      hierarchyPermissions,
    }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'READ') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hierarchyPermissions),
  },
  {
    title: 'sijoittelun-tulokset.otsikko',
    route: 'sijoittelun-tulokset',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      usesValintalaskenta,
      hierarchyPermissions,
    }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'READ') &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, hierarchyPermissions),
  },
  {
    title: 'valinnan-tulokset.otsikko',
    route: 'valinnan-tulokset',
    visibleFn: ({
      hakukohde,
      haunAsetukset,
      usesValintalaskenta,
      hierarchyPermissions,
    }) =>
      hasHierarchyPermission(hakukohde, hierarchyPermissions, 'READ') &&
      !usesValintalaskenta &&
      !haunAsetukset.sijoittelu &&
      isValinnatAllowedForHaku(haunAsetukset, hierarchyPermissions),
  },
] as const;

export const isHakukohdeTabVisible = ({
  tab,
  ...visibleProps
}: { tab: BasicTab } & VisibleFnProps) => {
  return !tab.visibleFn || tab.visibleFn(visibleProps);
};

export const getVisibleHakukohdeTabs = (visibleProps: VisibleFnProps) => {
  return TABS.filter((tab) => isHakukohdeTabVisible({ tab, ...visibleProps }));
};
