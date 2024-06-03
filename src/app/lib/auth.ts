//TODO: check in (ticket) if service "VALINTOJENTOTEUTTAMINENKK" should still be considered
export const AUTH_SERVICE = 'VALINTOJENTOTEUTTAMINEN';
//TODO: check also in (ticket) if role "TULOSTENTUONTI" is relevant
export type RIGHT = 'CRUD' | 'READ' | 'READ_UPDATE';

export type RightToOrganization = {
  organizationOid: string;
  rights: RIGHT[];
};

export type UserRights = {
  admin: boolean;
  readOrganizations: string[];
  writeOrganizations: string[];
  crudOrganizations: string[];
};

const allowedToWrite = (right: RIGHT) =>
  ['CRUD', 'READ_UPDATE'].includes(right);
const allowedToCRUD = (right: RIGHT) => right === 'CRUD';
const allowedToRead = (right: RIGHT) =>
  ['CRUD', 'READ', 'READ_UPDATE'].includes(right);

export function getOrgsForRight(
  rights: RightToOrganization[],
  right: RIGHT,
): string[] {
  const filterByRight = (rightFn: (right: RIGHT) => boolean): string[] =>
    rights.filter((o) => o.rights.some(rightFn)).map((o) => o.organizationOid);
  switch (right) {
    case 'CRUD':
      return filterByRight(allowedToCRUD);
    case 'READ_UPDATE':
      return filterByRight(allowedToWrite);
    case 'READ':
      return filterByRight(allowedToRead);
    default:
      throw Error('Unknown right passed ' + right);
  }
}
