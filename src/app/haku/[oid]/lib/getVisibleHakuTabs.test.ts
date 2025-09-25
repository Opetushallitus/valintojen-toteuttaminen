import { describe, it, expect } from 'vitest';
import { getVisibleHakuTabs } from './getVisibleHakuTabs';
import { UserPermissions } from '@/lib/permissions';
import { OPH_ORGANIZATION_OID } from '@/lib/constants';

const TARJOAJA_OID = '1.2.3.4';

const NO_PERMISSION: UserPermissions = {
  readOrganizations: [],
  writeOrganizations: [],
  crudOrganizations: [],
  hasOphCRUD: false,
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: false,
} as UserPermissions;

const READ_PERMISSION: UserPermissions = {
  readOrganizations: [TARJOAJA_OID],
  writeOrganizations: [],
  crudOrganizations: [],
  hasOphCRUD: false,
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: false,
} as UserPermissions;

const CRUD_PERMISSION: UserPermissions = {
  readOrganizations: [TARJOAJA_OID],
  writeOrganizations: [TARJOAJA_OID],
  crudOrganizations: [TARJOAJA_OID],
  hasOphCRUD: false,
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: false,
} as UserPermissions;

const OPH_PERMISSION: UserPermissions = {
  readOrganizations: [OPH_ORGANIZATION_OID],
  writeOrganizations: [OPH_ORGANIZATION_OID],
  crudOrganizations: [OPH_ORGANIZATION_OID],
  hasOphCRUD: true,
  sijoitteluPeruuntuneidenHyvaksyntaAllowed: false,
} as UserPermissions;

describe('getVisibleHakuTabs', () => {
  const tarjoajaOids = [TARJOAJA_OID];

  it("returns ['hakukohde', 'henkilo'] when has READ permission", () => {
    const result = getVisibleHakuTabs({
      hierarchyPermissions: READ_PERMISSION,
      tarjoajaOids,
      hasValintaryhma: false,
    });
    expect(result).toEqual(['hakukohde', 'henkilo']);
  });

  it('returns all tabs when has CRUD permissions and hasValintaryhma is true', () => {
    const result = getVisibleHakuTabs({
      hierarchyPermissions: CRUD_PERMISSION,
      tarjoajaOids,
      hasValintaryhma: true,
    });
    expect(result).toEqual([
      'hakukohde',
      'henkilo',
      'valintaryhma',
      'yhteisvalinnan-hallinta',
    ]);
  });

  it("returns only ['hakukohde', 'henkilo'] when has only READ and hasValintaryhma is true", () => {
    const result = getVisibleHakuTabs({
      hierarchyPermissions: READ_PERMISSION,
      tarjoajaOids,
      hasValintaryhma: true,
    });
    expect(result).toEqual(['hakukohde', 'henkilo']);
  });

  it('returns all tabs when OPH permission and hasValintaryhma is true', () => {
    const result = getVisibleHakuTabs({
      hierarchyPermissions: OPH_PERMISSION,
      tarjoajaOids,
      hasValintaryhma: true,
    });
    expect(result).toEqual([
      'hakukohde',
      'henkilo',
      'valintaryhma',
      'yhteisvalinnan-hallinta',
    ]);
  });

  it("doesn't return valintaryhma even with CRUD permissions when hasValintaryhma is false", () => {
    const result = getVisibleHakuTabs({
      hierarchyPermissions: CRUD_PERMISSION,
      tarjoajaOids,
      hasValintaryhma: false,
    });
    expect(result).toEqual(['hakukohde', 'henkilo', 'yhteisvalinnan-hallinta']);
  });

  it("doesn't return valintaryhma even with OPH permissions when hasValintaryhma is false", () => {
    const result = getVisibleHakuTabs({
      hierarchyPermissions: OPH_PERMISSION,
      tarjoajaOids,
      hasValintaryhma: false,
    });
    expect(result).toEqual(['hakukohde', 'henkilo', 'yhteisvalinnan-hallinta']);
  });

  it('returns empty array when no permissions', () => {
    const result = getVisibleHakuTabs({
      hierarchyPermissions: NO_PERMISSION,
      tarjoajaOids,
      hasValintaryhma: false,
    });
    expect(result).toEqual([]);
  });
});
