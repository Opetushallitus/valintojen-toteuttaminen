import {
  isHarkinnanvarainenHakukohde,
  isKorkeakouluHaku,
} from '@/lib/kouta/kouta-service';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { UserPermissions } from '@/lib/permissions';
import { isInRange, toFinnishDate } from '@/lib/time-utils';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { hasOrganizationPermissions } from '@/hooks/useUserPermissions';

type VisibleFnProps = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
  usesValintalaskenta: boolean;
  permissions: UserPermissions;
  organizationOidPath: Array<string>;
};

export type BasicTab = {
  title: string;
  route: string;
  visibleFn?: (props: VisibleFnProps) => boolean;
};

const isValinnatAllowedForHaku = (
  haunAsetukset: HaunAsetukset,
  permissions: UserPermissions,
) => {
  return (
    permissions.hasOphCRUD ||
    isInRange(
      toFinnishDate(new Date()),
      haunAsetukset?.valinnatEstettyOppilaitosvirkailijoilta?.dateStart,
      haunAsetukset?.valinnatEstettyOppilaitosvirkailijoilta?.dateEnd,
    )
  );
};

export const TABS: Array<BasicTab> = [
  {
    title: 'perustiedot.otsikko',
    route: 'perustiedot',
    visibleFn: ({ permissions, organizationOidPath }) =>
      hasOrganizationPermissions(organizationOidPath, 'READ', permissions),
  },
  {
    title: 'hakeneet.otsikko',
    route: 'hakeneet',
    visibleFn: ({ haunAsetukset, permissions, organizationOidPath }) =>
      hasOrganizationPermissions(organizationOidPath, 'READ', permissions) &&
      isValinnatAllowedForHaku(haunAsetukset, permissions),
  },
  {
    title: 'valinnanhallinta.otsikko',
    route: 'valinnan-hallinta',
    visibleFn: ({
      haunAsetukset,
      permissions,
      usesValintalaskenta,
      organizationOidPath,
    }) =>
      hasOrganizationPermissions(organizationOidPath, 'CRUD', permissions) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, permissions),
  },
  {
    title: 'valintakoekutsut.otsikko',
    route: 'valintakoekutsut',
    visibleFn: ({
      haunAsetukset,
      permissions,
      usesValintalaskenta,
      organizationOidPath,
    }) =>
      hasOrganizationPermissions(organizationOidPath, 'READ', permissions) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, permissions),
  },
  {
    title: 'pistesyotto.otsikko',
    route: 'pistesyotto',
    visibleFn: ({
      haunAsetukset,
      permissions,
      usesValintalaskenta,
      organizationOidPath,
    }) =>
      hasOrganizationPermissions(
        organizationOidPath,
        'READ_UPDATE',
        permissions,
      ) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, permissions),
  },
  {
    title: 'harkinnanvaraiset.otsikko',
    route: 'harkinnanvaraiset',
    visibleFn: ({
      haku,
      hakukohde,
      haunAsetukset,
      permissions,
      usesValintalaskenta,
      organizationOidPath,
    }) =>
      hasOrganizationPermissions(organizationOidPath, 'READ', permissions) &&
      !isKorkeakouluHaku(haku) &&
      isHarkinnanvarainenHakukohde(hakukohde) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, permissions),
  },
  {
    title: 'hakijaryhmat.otsikko',
    route: 'hakijaryhmat',
    visibleFn: ({
      haku,
      haunAsetukset,
      usesValintalaskenta,
      permissions,
      organizationOidPath,
    }) =>
      hasOrganizationPermissions(organizationOidPath, 'READ', permissions) &&
      isKorkeakouluHaku(haku) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, permissions),
  },
  {
    title: 'valintalaskennan-tulokset.otsikko',
    route: 'valintalaskennan-tulokset',
    visibleFn: ({
      haunAsetukset,
      usesValintalaskenta,
      permissions,
      organizationOidPath,
    }) =>
      hasOrganizationPermissions(organizationOidPath, 'READ', permissions) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, permissions),
  },
  {
    title: 'sijoittelun-tulokset.otsikko',
    route: 'sijoittelun-tulokset',
    visibleFn: ({
      haunAsetukset,
      usesValintalaskenta,
      permissions,
      organizationOidPath,
    }) =>
      hasOrganizationPermissions(organizationOidPath, 'READ', permissions) &&
      (haunAsetukset.sijoittelu || usesValintalaskenta) &&
      isValinnatAllowedForHaku(haunAsetukset, permissions),
  },
  {
    title: 'valinnan-tulokset.otsikko',
    route: 'valinnan-tulokset',
    visibleFn: ({
      haunAsetukset,
      usesValintalaskenta,
      permissions,
      organizationOidPath,
    }) =>
      hasOrganizationPermissions(organizationOidPath, 'READ', permissions) &&
      !usesValintalaskenta &&
      !haunAsetukset.sijoittelu &&
      isValinnatAllowedForHaku(haunAsetukset, permissions),
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
