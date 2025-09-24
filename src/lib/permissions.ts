import { OPH_ORGANIZATION_OID } from './constants';

export const VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY = 'VALINTOJENTOTEUTTAMINEN';

export const SIJOITTELU_SERVICE_KEY = 'SIJOITTELU';

export const PERUUNTUNEIDEN_HYVAKSYNTA_PERMISSION_KEY =
  'PERUUNTUNEIDEN_HYVAKSYNTA';

export type Permission =
  | 'CRUD'
  | 'READ'
  | 'READ_UPDATE'
  | 'PERUUNTUNEIDEN_HYVAKSYNTA';

export type OrganizationPermissions = {
  organizationOid: string;
  serviceKey: string;
  permissions: Array<Permission>;
};

export type UserPermissions = {
  readOrganizations: Array<string>;
  writeOrganizations: Array<string>;
  crudOrganizations: Array<string>;
  hasOphCRUD: boolean;
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: boolean;
};

export type PermissionsResponseData = {
  organisaatiot: Array<{
    organisaatioOid: string;
    kayttooikeudet: Array<{ palvelu: string; oikeus: Permission }>;
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
  permission: Permission,
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
  permission: Permission,
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
