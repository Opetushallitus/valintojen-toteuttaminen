import { OPH_ORGANIZATION_OID } from './constants';

//TODO: check in OK-519 if service "VALINTOJENTOTEUTTAMINENKK" should still be considered
export const VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY = 'VALINTOJENTOTEUTTAMINEN';

export const VALINTAPERUSTEET_SERVICE_KEY = 'VALINTAPERUSTEET';

//TODO: check also in OK-519 if role "TULOSTENTUONTI" is relevant
export type Permission = 'CRUD' | 'READ' | 'READ_UPDATE';

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
};

export type UserPermissionsByService = Record<string, UserPermissions>;

export type PermissionsResponseData = {
  organisaatiot: Array<{
    organisaatioOid: string;
    kayttooikeudet: Array<{ palvelu: string; oikeus: Permission }>;
  }>;
};

export const selectUserPermissions = (
  permissionsData: PermissionsResponseData,
): UserPermissionsByService => {
  const organizations = permissionsData.organisaatiot.flatMap((o) => {
    return o.kayttooikeudet.map((p) => {
      return {
        organisaatioOid: o.organisaatioOid,
        serviceKey: p.palvelu,
        permission: p.oikeus,
      };
    });
  });

  return organizations.reduce((result, org) => {
    const { organisaatioOid, serviceKey, permission } = org;
    if (!result[serviceKey]) {
      result[serviceKey] = {
        readOrganizations: [],
        writeOrganizations: [],
        crudOrganizations: [],
        hasOphCRUD: false,
      };
    }
    const serviceResult = result[serviceKey];
    if (
      permission === 'CRUD' &&
      !serviceResult.crudOrganizations.includes(organisaatioOid)
    ) {
      serviceResult.crudOrganizations.push(organisaatioOid);
      if (organisaatioOid === OPH_ORGANIZATION_OID) {
        serviceResult.hasOphCRUD = true;
      }
    }
    if (
      ['CRUD', 'READ_UPDATE'].includes(permission) &&
      !serviceResult.writeOrganizations.includes(organisaatioOid)
    ) {
      serviceResult.writeOrganizations.push(organisaatioOid);
    }
    if (
      ['CRUD', 'READ_UPDATE', 'READ'].includes(permission) &&
      !serviceResult.readOrganizations.includes(organisaatioOid)
    ) {
      serviceResult.readOrganizations.push(organisaatioOid);
    }

    return result;
  }, {} as UserPermissionsByService);
};
