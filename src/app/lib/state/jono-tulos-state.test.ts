import { describe, expect, test } from 'vitest';
import { createActor } from 'xstate';
import {
  JonoTulosState,
  JonoTulosEventType,
  type JonoTulosChangeEvent,
  type JarjestysperusteChangeEvent,
  type JonoTulosContextInput,
  jonoTulosMachine,
  JarjestysPeruste,
} from './jono-tulos-state';
import { TuloksenTila } from '../types/laskenta-types';
import { JonoSija } from '@/app/hooks/useLasketutValinnanVaiheet';
import { when } from 'remeda';

const mockContextInput = ({
  jonoTulos = {},
  jarjestysperuste = 'jonosija',
}: {
  jonoTulos?: Partial<JonoSija>;
  jarjestysperuste?: JarjestysPeruste;
} = {}) => {
  const { pisteet = '', jonosija = '', tuloksenTila, muutoksenSyy } = jonoTulos;
  const arvo = when(
    jarjestysperuste === 'kokonaispisteet'
      ? Number(pisteet)
      : -Number(jonosija),
    isNaN,
    () => 0,
  );
  return {
    hakukohde: { oid: '1', tarjoajaOid: '1', hakuOid: '1' },
    valinnanvaihe: {
      valinnanvaiheoid: '1',
      nimi: 'vaihe1',
      jarjestysnumero: 1,
      createdAt: 0,
    },
    valintatapajono: {
      oid: 'jono1',
      valintatapajonooid: 'jono1',
      nimi: 'jono1',
      jonosijat: [
        {
          tuloksenTila,
          hakemusOid: 'hakemus1',
          muutoksenSyy,
          hakijaOid: 'hakija1',
          jarjestyskriteerit: jonoTulos
            ? [
                {
                  tila: tuloksenTila,
                  nimi: '',
                  prioriteetti: 0,
                  arvo,
                },
              ]
            : [],
          jonosija,
          pisteet,
        },
      ],
      kaytetaanKokonaispisteita: jarjestysperuste === 'kokonaispisteet',
      prioriteetti: 1,
      valmisSijoiteltavaksi: false,
      siirretaanSijoitteluun: false,
    },
    onEvent: () => {},
  } as JonoTulosContextInput;
};

describe('JonoTulosMachine', () => {
  test('should initialize in IDLE state', () => {
    const actor = createActor(jonoTulosMachine, { input: mockContextInput() });
    actor.start();
    expect(actor.getSnapshot().value).toBe(JonoTulosState.IDLE);
  });

  test('should change tuloksenTila from undefined to HYVAKSYTTAVISSA when pisteet changes', () => {
    const actor = createActor(jonoTulosMachine, { input: mockContextInput() });
    actor.start();
    const changeEvent: JonoTulosChangeEvent = {
      type: JonoTulosEventType.JONOTULOS_CHANGED,
      hakemusOid: 'hakemus1',
      pisteet: '10',
    };
    actor.send(changeEvent);
    const jonoTuloksetSnapshot =
      actor.getSnapshot().context.changedJonoTulokset;
    console.log(jonoTuloksetSnapshot);
    expect(jonoTuloksetSnapshot['hakemus1']).toMatchObject({
      hakemusOid: 'hakemus1',
      tuloksenTila: TuloksenTila.HYVAKSYTTAVISSA,
      pisteet: '10',
    });
  });

  test('should change tuloksenTila from MAARITTELEMATON to HYVAKSYTTAVISSA when pisteet changes', () => {
    const actor = createActor(jonoTulosMachine, {
      input: mockContextInput({
        jonoTulos: { tuloksenTila: TuloksenTila.MAARITTELEMATON },
      }),
    });
    actor.start();
    const changeEvent: JonoTulosChangeEvent = {
      type: JonoTulosEventType.JONOTULOS_CHANGED,
      hakemusOid: 'hakemus1',
      pisteet: '10',
    };
    actor.send(changeEvent);
    const jonoTuloksetSnapshot =
      actor.getSnapshot().context.changedJonoTulokset;
    console.log(jonoTuloksetSnapshot);
    expect(jonoTuloksetSnapshot['hakemus1']).toMatchObject({
      hakemusOid: 'hakemus1',
      tuloksenTila: TuloksenTila.HYVAKSYTTAVISSA,
      pisteet: '10',
    });
  });

  test('should reset pisteet and jonosijat when changing tuloksentila to HYLATTY', () => {
    const actor = createActor(jonoTulosMachine, {
      input: mockContextInput({
        jonoTulos: {
          tuloksenTila: TuloksenTila.MAARITTELEMATON,
          jonosija: '1',
          pisteet: '10',
        },
      }),
    });
    actor.start();

    const changeEvent: JonoTulosChangeEvent = {
      hakemusOid: 'hakemus1',
      type: JonoTulosEventType.JONOTULOS_CHANGED,
      tuloksenTila: TuloksenTila.HYLATTY,
    };

    actor.send(changeEvent);
    const jonoTuloksetSnapshot =
      actor.getSnapshot().context.changedJonoTulokset;

    expect(jonoTuloksetSnapshot['hakemus1'].tuloksenTila).toEqual(
      TuloksenTila.HYLATTY,
    );
    expect(jonoTuloksetSnapshot['hakemus1'].jonosija).toEqual('');
    expect(jonoTuloksetSnapshot['hakemus1'].pisteet).toEqual('');
  });

  test('should handle JARJESTYSPERUSTE_CHANGED event', () => {
    const actor = createActor(jonoTulosMachine, {
      input: mockContextInput({
        jonoTulos: {
          jonosija: '1',
        },
      }),
    });
    actor.start();
    const jarjestysperusteChangeEvent: JarjestysperusteChangeEvent = {
      type: JonoTulosEventType.JARJESTYSPERUSTE_CHANGED,
      jarjestysPeruste: 'kokonaispisteet',
    };
    actor.send(jarjestysperusteChangeEvent);
    const snapshot = actor.getSnapshot();
    expect(snapshot.context.jarjestysPeruste).toBe('kokonaispisteet');
    expect(snapshot.context.changedJonoTulokset['hakemus1'].tuloksenTila).toBe(
      TuloksenTila.MAARITTELEMATON,
    );
    expect(snapshot.context.changedJonoTulokset['hakemus1'].jonosija).toBe('');
  });

  test('should remove tulos from changes if modifying it to have same value as original', () => {
    const actor = createActor(jonoTulosMachine, {
      input: mockContextInput({
        jonoTulos: {
          jonosija: '1',
          muutoksenSyy: {
            fi: 'test fi',
          },
          tuloksenTila: TuloksenTila.HYVAKSYTTAVISSA,
        },
      }),
    });
    actor.start();
    actor.send({
      type: JonoTulosEventType.JONOTULOS_CHANGED,
      hakemusOid: 'hakemus1',
      jonosija: '5',
      kuvaus: {
        fi: 'test fi',
        sv: 'test sv',
      },
      tuloksenTila: TuloksenTila.HYVAKSYTTAVISSA,
    });
    let snapshot = actor.getSnapshot();

    expect(snapshot.context.changedJonoTulokset['hakemus1']).toMatchObject({
      hakemusOid: 'hakemus1',
      tuloksenTila: TuloksenTila.HYVAKSYTTAVISSA,
      jonosija: '5',
      muutoksenSyy: {
        fi: 'test fi',
      },
    });

    actor.send({
      type: JonoTulosEventType.JONOTULOS_CHANGED,
      hakemusOid: 'hakemus1',
      jonosija: '1',
      kuvaus: {
        fi: 'test fi',
      },
    });
    snapshot = actor.getSnapshot();
    expect(snapshot.context.changedJonoTulokset).toEqual({});
  });

  test('should stay in IDLE state on UPDATE event if there are no changes', () => {
    const actor = createActor(jonoTulosMachine, { input: mockContextInput() });
    actor.start();
    actor.send({ type: JonoTulosEventType.UPDATE });
    expect(actor.getSnapshot().value).toBe(JonoTulosState.IDLE);
  });
});
