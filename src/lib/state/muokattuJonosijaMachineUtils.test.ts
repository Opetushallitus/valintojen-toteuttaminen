import { describe, it, expect, beforeEach } from 'vitest';
import { applyKriteeriChange } from './muokattuJonosijaMachineUtils';
import {
  MuokattuJonosijaContext,
  MuokattuJonosijaChangeEvent,
  MuokattuJonosijaEventTypes,
} from './muokattuJonosijaMachineTypes';
import { TuloksenTila } from '../types/laskenta-types';

describe('applyKriteeriChange', () => {
  const context: MuokattuJonosijaContext = {
    jonosija: {
      hakemusOid: 'hakemus1',
      valintatapajonoOid: 'jono1',
      hakijaOid: 'hakija1',
      hakijanNimi: 'Ruhtinas Nukettaja',
      pisteet: '10',
      jonosija: '1',
      tuloksenTila: TuloksenTila.HYVAKSYTTAVISSA,
      jarjestyskriteerit: [
        {
          nimi: 'Kriteeri 1',
          prioriteetti: 1,
          arvo: 1.5,
          kuvaus: { FI: 'Selite 1' },
          tila: 'HYVAKSYTTY',
        },
        {
          nimi: 'Kriteeri 2',
          prioriteetti: 2,
          arvo: 2.5,
          kuvaus: { FI: 'Huono on' },
          tila: 'HYLATTY',
        },
      ],
      muokattu: false,
    },
    changedKriteerit: [],
    onSuccess: () => null,
  };

  beforeEach(() => (context.changedKriteerit = []));

  it('returns changed kriteeris', () => {
    const event: MuokattuJonosijaChangeEvent = {
      prioriteetti: 1,
      arvo: '2,5',
      selite: 'Selite 1',
      tila: 'HYVAKSYTTY',
      type: MuokattuJonosijaEventTypes.ADD,
    };
    expect(applyKriteeriChange(context, event)).toEqual([
      {
        prioriteetti: 1,
        arvo: '2,5',
        selite: 'Selite 1',
        tila: 'HYVAKSYTTY',
      },
    ]);
  });

  it('returns empty array if event contains no changes to original value', () => {
    const event: MuokattuJonosijaChangeEvent = {
      prioriteetti: 1,
      arvo: '1,5',
      selite: 'Selite 1',
      tila: 'HYVAKSYTTY',
      type: MuokattuJonosijaEventTypes.ADD,
    };
    expect(applyKriteeriChange(context, event)).toEqual([]);
  });

  it('returns changed kriteerit, both old and new', () => {
    context.changedKriteerit = [
      {
        prioriteetti: 2,
        arvo: '5',
        selite: 'Tää onkin hyvä',
        tila: 'HYVAKSYTTY',
      },
    ];
    expect(
      applyKriteeriChange(context, {
        prioriteetti: 1,
        arvo: '-1,5',
        tila: 'HYLATTY',
        selite: 'Mut tää onkin huono',
        type: MuokattuJonosijaEventTypes.ADD,
      }),
    ).toEqual([
      {
        prioriteetti: 2,
        arvo: '5',
        selite: 'Tää onkin hyvä',
        tila: 'HYVAKSYTTY',
      },
      {
        prioriteetti: 1,
        arvo: '-1,5',
        selite: 'Mut tää onkin huono',
        tila: 'HYLATTY',
      },
    ]);
  });

  it('removes changed kriteeri from response if it is changed back to equal original', () => {
    context.changedKriteerit = [
      {
        prioriteetti: 2,
        arvo: '5',
        selite: 'Tää onkin hyvä',
        tila: 'HYVAKSYTTY',
      },
    ];
    expect(
      applyKriteeriChange(context, {
        prioriteetti: 2,
        arvo: '2,5',
        tila: 'HYLATTY',
        selite: 'Huono on',
        type: MuokattuJonosijaEventTypes.ADD,
      }),
    ).toEqual([]);
  });
});
