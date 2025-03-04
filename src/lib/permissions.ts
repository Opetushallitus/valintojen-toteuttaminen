//TODO: check in OK-519 if service "VALINTOJENTOTEUTTAMINENKK" should still be considered
export const SERVICE_KEY = 'VALINTOJENTOTEUTTAMINEN';
//TODO: check also in OK-519 if role "TULOSTENTUONTI" is relevant
export type Permission = 'CRUD' | 'READ' | 'READ_UPDATE';

export type OrganizationPermissions = {
  organizationOid: string;
  permissions: Array<Permission>;
};

export type UserPermissions = {
  admin: boolean;
  readOrganizations: Array<string>;
  writeOrganizations: Array<string>;
  crudOrganizations: Array<string>;
};

const allowedToWrite = (right: Permission) =>
  ['CRUD', 'READ_UPDATE'].includes(right);
const allowedToCRUD = (right: Permission) => right === 'CRUD';
const allowedToRead = (right: Permission) =>
  ['CRUD', 'READ', 'READ_UPDATE'].includes(right);

export function getOrgsForPermission(
  permissions: Array<OrganizationPermissions>,
  permission: Permission,
): Array<string> {
  const filterByPermission = (
    rightFn: (right: Permission) => boolean,
  ): Array<string> =>
    permissions
      .filter((o) => o.permissions.some(rightFn))
      .map((o) => o.organizationOid);
  switch (permission) {
    case 'CRUD':
      return filterByPermission(allowedToCRUD);
    case 'READ_UPDATE':
      return filterByPermission(allowedToWrite);
    case 'READ':
      return filterByPermission(allowedToRead);
    default:
      throw Error('Unknown right passed ' + permission);
  }
}
