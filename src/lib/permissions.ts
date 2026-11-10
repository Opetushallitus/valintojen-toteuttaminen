import { isHakukohderyhmaOid } from './common';
import {
  OrganizationTree,
  findBranchOidsFromOrganizationHierarchy,
} from './organization-hierarchy';
import { unique } from 'remeda';
import { OPH_ORGANIZATION_OID } from './constants';
import type { Hakukohde } from './kouta/kouta-types';

export const VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY = 'VALINTOJENTOTEUTTAMINEN';

export const SIJOITTELU_SERVICE_KEY = 'SIJOITTELU';

export const PERUUNTUNEIDEN_HYVAKSYNTA_PERMISSION_KEY =
  'PERUUNTUNEIDEN_HYVAKSYNTA';

export type PermissionLevel =
  'CRUD' | 'READ' | 'READ_UPDATE' | 'PERUUNTUNEIDEN_HYVAKSYNTA';

export type OrganizationPermissions = {
  organizationOid: string;
  serviceKey: string;
  permissions: Array<PermissionLevel>;
};

export type UserPermissions = {
  readOrganizations: Array<string>;
  writeOrganizations: Array<string>;
  crudOrganizations: Array<string>;
  hasOphCRUD: boolean;
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: boolean;
};

/** Oikeudet on täydennetty aktiivisten organisaatioiden hierarkiasta. */
export type HierarchyUserPermissions = UserPermissions & {
  organizationHierarchyIncluded: true;
};

export type HakukohdePermissionLevel = 'READ' | 'READ_UPDATE' | 'CRUD';

/** Hakukohde-OID:t, joihin käyttäjällä on ryhmien kautta kyseinen oikeustaso. */
export type HakukohderyhmaPermissions = Record<
  HakukohdePermissionLevel,
  ReadonlyArray<string>
>;

export const EMPTY_HAKUKOHDERYHMA_PERMISSIONS: HakukohderyhmaPermissions = {
  READ: [],
  READ_UPDATE: [],
  CRUD: [],
};

export type HakuPermissions = {
  hakuOid: string;
  userPermissions: HierarchyUserPermissions;
  hakukohderyhmaPermissions: HakukohderyhmaPermissions;
};

export type PermissionsResponseData = {
  organisaatiot: Array<{
    organisaatioOid: string;
    kayttooikeudet: Array<{ palvelu: string; oikeus: PermissionLevel }>;
  }>;
};

export const selectUserPermissions = (
  permissionsData: PermissionsResponseData,
): UserPermissions => {
  const organizations = permissionsData.organisaatiot.flatMap((o) => {
    return o.kayttooikeudet.map((p) => {
      return {
        organisaatioOid: o.organisaatioOid,
        serviceKey: p.palvelu,
        permission: p.oikeus,
      };
    });
  });

  const canHyvaksyPeruuntunut =
    organizations.find(
      (o) =>
        o.permission === PERUUNTUNEIDEN_HYVAKSYNTA_PERMISSION_KEY &&
        o.serviceKey === SIJOITTELU_SERVICE_KEY,
    )?.organisaatioOid === OPH_ORGANIZATION_OID;

  return organizations
    .filter((o) => o.serviceKey === VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY)
    .reduce(
      (result, org) => {
        const { organisaatioOid, permission } = org;
        if (
          permission === 'CRUD' &&
          !result.crudOrganizations.includes(organisaatioOid)
        ) {
          result.crudOrganizations.push(organisaatioOid);
          if (organisaatioOid === OPH_ORGANIZATION_OID) {
            result.hasOphCRUD = true;
          }
        }
        if (
          ['CRUD', 'READ_UPDATE'].includes(permission) &&
          !result.writeOrganizations.includes(organisaatioOid)
        ) {
          result.writeOrganizations.push(organisaatioOid);
        }
        if (
          ['CRUD', 'READ_UPDATE', 'READ'].includes(permission) &&
          !result.readOrganizations.includes(organisaatioOid)
        ) {
          result.readOrganizations.push(organisaatioOid);
        }

        return result;
      },
      {
        readOrganizations: [],
        writeOrganizations: [],
        crudOrganizations: [],
        hasOphCRUD: false,
        sijoitteluPeruuntuneidenHyvaksyntaAllowed: canHyvaksyPeruuntunut,
      } as UserPermissions,
    );
};

const checkHasSomeOrganizationPermission = (
  organizationOids: Array<string> | string | undefined = [],
  permissionOrganizationOids: Array<string> | undefined = [],
) => {
  // Jos on oikeus OPH-organisaatioon, on myös oikeus kaikkiin muihin organisaatioihin
  if (permissionOrganizationOids.includes(OPH_ORGANIZATION_OID)) {
    return true;
  }

  const organizationOidsArray =
    organizationOids === undefined || Array.isArray(organizationOids)
      ? organizationOids
      : [organizationOids];

  return (
    permissionOrganizationOids.find((oid) =>
      organizationOidsArray?.includes(oid),
    ) !== undefined
  );
};

export const selectOrganizationsOidsByPermission = (
  userPermissions: UserPermissions,
  permission: PermissionLevel,
) => {
  switch (permission) {
    case 'READ':
      return userPermissions.readOrganizations;
    case 'READ_UPDATE':
      return userPermissions.writeOrganizations;
    case 'CRUD':
      return userPermissions.crudOrganizations;
    default:
      throw new Error(`Unknown permission type: ${permission}`);
  }
};

/**
 * Tarkistaa, onko käyttäjällä permission-parametrin mukainen käyttöoikeus johonkin annetuista organisaatioista.
 * @param organizationOids Organisaatioiden solmuluokat, joiden käyttöoikeudet halutaan tarkistaa.
 * @param hierarchyPermissions Käyttäjän organisaatiohierarkiasta täydennetyt käyttöoikeudet (kts. useHierarchyUserPermissions).
 * @param permission Käyttöoikeus, jota tarkistetaan ('CRUD', 'READ', 'READ_UPDATE').
 * @returns Boolean: Onko käyttäjällä käyttöoikeus johonkin annetuista organisaatioista?
 */
export const checkHasPermission = (
  organizationOids: Array<string> | string | undefined,
  hierarchyPermissions: UserPermissions,
  permission: PermissionLevel,
) => {
  const permissionOrganizationOids = selectOrganizationsOidsByPermission(
    hierarchyPermissions,
    permission,
  );

  return checkHasSomeOrganizationPermission(
    organizationOids,
    permissionOrganizationOids,
  );
};

export const EMPTY_USER_PERMISSIONS: UserPermissions = {
  readOrganizations: [],
  writeOrganizations: [],
  crudOrganizations: [],
  hasOphCRUD: false,
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: false,
};

export const checkHasHakukohdePermission = (
  hakukohde: Pick<Hakukohde, 'oid' | 'hakuOid' | 'tarjoajaOid'>,
  hakuPermissions: HakuPermissions,
  permission: HakukohdePermissionLevel,
) =>
  hakukohde.hakuOid === hakuPermissions.hakuOid &&
  (checkHasPermission(
    hakukohde.tarjoajaOid,
    hakuPermissions.userPermissions,
    permission,
  ) ||
    hakuPermissions.hakukohderyhmaPermissions[permission].includes(
      hakukohde.oid,
    ));

export const expandUserPermissions = (
  permissions: UserPermissions,
  hierarchy: Array<OrganizationTree> = [],
): HierarchyUserPermissions => {
  const expand = (oids: Array<string>) =>
    unique([
      ...oids.filter(isHakukohderyhmaOid),
      ...findBranchOidsFromOrganizationHierarchy(hierarchy, oids),
    ]);
  return {
    ...permissions,
    organizationHierarchyIncluded: true,
    readOrganizations: expand(permissions.readOrganizations),
    writeOrganizations: expand(permissions.writeOrganizations),
    crudOrganizations: expand(permissions.crudOrganizations),
  };
};
