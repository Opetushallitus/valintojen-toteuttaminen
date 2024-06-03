export const AUTH_SERVICE = 'VALINTOJENTOTEUTTAMINEN'; //"VALINTOJENTOTEUTTAMINENKK" //Oikeudet? "CRUD" "TULOSTENTUONTI" "READ" "WRITE"
export type RIGHT = 'CRUD' | 'READ' | 'WRITE';
//const OPH_ORG = '1.2.246.562.10.00000000001' // RELEVANT?

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

const allowedToWrite = (right: RIGHT) => ['CRUD', 'WRITE'].includes(right);
const allowedToCRUD = (right: RIGHT) => right === 'CRUD';
const allowedToRead = (right: RIGHT) =>
  ['CRUD', 'READ', 'WRITE'].includes(right);

export function getOrgsForRight(
  rights: RightToOrganization[],
  right: RIGHT,
): string[] {
  const filterByRight = (rightFn: (right: RIGHT) => boolean): string[] =>
    rights.filter((o) => o.rights.some(rightFn)).map((o) => o.organizationOid);
  switch (right) {
    case 'CRUD':
      return filterByRight(allowedToCRUD);
    case 'WRITE':
      return filterByRight(allowedToWrite);
    case 'READ':
      return filterByRight(allowedToRead);
    default:
      throw Error('Unknown right passed ' + right);
  }
}
