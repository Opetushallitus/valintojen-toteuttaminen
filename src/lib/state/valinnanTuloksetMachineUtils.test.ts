import { describe, expect, test } from 'vitest';
import { applySingleHakemusChange } from './valinnanTuloksetMachineUtils';
import {
  ValinnanTulosContext,
  ValinnanTulosEventType,
} from './valinnanTuloksetMachineTypes';
import { HakemuksenValinnanTulos } from '../valinta-tulos-service/valinta-tulos-types';

const ORIGINAL_LAHETETTY = '2025-01-02T03:04:05.000Z';

const createContext = (
  hyvaksymiskirjeLahetetty: string | null,
): ValinnanTulosContext<HakemuksenValinnanTulos> => ({
  hakemukset: [
    {
      hakemusOid: 'hakemus1',
      hakijaOid: 'hakija1',
      hakijanNimi: 'Hakija Yksi',
      hyvaksymiskirjeLahetetty,
    },
  ],
  changedHakemukset: [],
  mode: 'sijoittelu',
});

const changeHyvaksymiskirjeLahetetty = (
  context: ValinnanTulosContext<HakemuksenValinnanTulos>,
  hyvaksymiskirjeLahetetty: string | null,
) => ({
  ...context,
  changedHakemukset: applySingleHakemusChange(context, {
    type: ValinnanTulosEventType.CHANGE,
    hakemusOid: 'hakemus1',
    hyvaksymiskirjeLahetetty,
  }),
});

describe('applySingleHakemusChange: hyvaksymiskirjeLahetetty', () => {
  test('keeps the original timestamp when checkbox is unchecked and checked again', () => {
    const unchecked = changeHyvaksymiskirjeLahetetty(
      createContext(ORIGINAL_LAHETETTY),
      null,
    );
    expect(unchecked.changedHakemukset).toHaveLength(1);
    expect(unchecked.changedHakemukset[0]?.hyvaksymiskirjeLahetetty).toBeNull();

    const rechecked = changeHyvaksymiskirjeLahetetty(
      unchecked,
      new Date().toISOString(),
    );
    expect(rechecked.changedHakemukset).toHaveLength(0);
  });

  test('uses the new timestamp when there was no original timestamp', () => {
    const newLahetetty = '2026-10-05T10:00:00.000Z';
    const checked = changeHyvaksymiskirjeLahetetty(
      createContext(null),
      newLahetetty,
    );
    expect(checked.changedHakemukset[0]?.hyvaksymiskirjeLahetetty).toBe(
      newLahetetty,
    );

    const unchecked = changeHyvaksymiskirjeLahetetty(checked, null);
    expect(unchecked.changedHakemukset).toHaveLength(0);
  });
});
