import {
  ValintakokeenPisteet,
  ValintakoeOsallistuminenTulos,
} from '@/lib/types/laskenta-types';
import { describe, expect, test } from 'vitest';
import { createHenkilonPisteSyottoMachine } from './henkilon-pistesyotto-state';
import { createActor } from 'xstate';
import { PisteSyottoEvent } from '@/lib/state/pistesyotto-state';
import { HakijaInfo } from '@/lib/ataru/ataru-types';

type GeneratePistetiedotProps = {
  arvo: string | undefined;
  osallistuminen: ValintakoeOsallistuminenTulos;
  tunniste: string;
};

const hakija: HakijaInfo = {
  hakijanNimi: 'Meikäläinen Matti',
  hakemusOid: '1',
  hakijaOid: '3',
  etunimet: 'Matti',
  sukunimi: 'Meikäläinen',
  asiointikieliKoodi: 'fi',
  henkilotunnus: '',
  lahiosoite: '',
  postinumero: '',
};

const generatePistetiedot = (
  pisteet: Array<GeneratePistetiedotProps>,
): Array<ValintakokeenPisteet> =>
  pisteet.map(({ tunniste, arvo, osallistuminen }) => ({
    osallistuminenTunniste: `${tunniste}_osallistuminen`,
    tunniste,
    arvo,
    osallistuminen,
  }));

const initPistesyottoState = (pistetiedot: Array<ValintakokeenPisteet>) => {
  const machine = createHenkilonPisteSyottoMachine(
    hakija,
    pistetiedot,
    [],
    () => {},
  );
  const actor = createActor(machine);
  actor.start();
  return actor;
};

describe('createPisteSyottoMachine', () => {
  test('updates arvo twice', async () => {
    const pistetieto = generatePistetiedot([
      {
        tunniste: '2',
        arvo: '8.0',
        osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
      },
    ]);
    const actor = initPistesyottoState(pistetieto);
    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '2',
      arvo: '8.',
    });

    let changedPistetiedot = actor.getSnapshot().context.changedPistetiedot;

    expect(changedPistetiedot[0]).toMatchObject(
      generatePistetiedot([
        {
          tunniste: '2',
          arvo: '8.',
          osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
        },
      ])[0]!,
    );

    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '2',
      arvo: '8.1',
    });

    changedPistetiedot = actor.getSnapshot().context.changedPistetiedot;

    expect(changedPistetiedot[0]).toMatchObject(
      generatePistetiedot([
        {
          tunniste: '2',
          arvo: '8.1',
          osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
        },
      ])[0]!,
    );
  });

  test('removes changed pistetieto that has same values as original', async () => {
    const pistetieto = generatePistetiedot([
      {
        tunniste: '2',
        arvo: undefined,
        osallistuminen: ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
      },
    ]);
    const actor = initPistesyottoState(pistetieto);
    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '2',
      osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
      arvo: '8.0',
    });

    let changedPistetiedot = actor.getSnapshot().context.changedPistetiedot;

    expect(changedPistetiedot[0]).toMatchObject(
      generatePistetiedot([
        {
          tunniste: '2',
          arvo: '8.0',
          osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
        },
      ])[0]!,
    );

    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '2',
      osallistuminen: ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
      arvo: '',
    });

    changedPistetiedot = actor.getSnapshot().context.changedPistetiedot;

    expect(changedPistetiedot).toEqual([]);
  });

  test('changes osallistuminen from "MERKITSEMATTA" to "OSALLISTUI", when changing pisteet', async () => {
    const pistetieto = generatePistetiedot([
      {
        tunniste: '2',
        arvo: '',
        osallistuminen: ValintakoeOsallistuminenTulos.MERKITSEMATTA,
      },
    ]);
    const actor = initPistesyottoState(pistetieto);
    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '2',
      arvo: '8.0',
    });
    const changedPistetiedot =
      actor.getSnapshot().context.changedPistetiedot?.[0];

    expect(changedPistetiedot).toMatchObject(
      generatePistetiedot([
        {
          tunniste: '2',
          arvo: '8.0',
          osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
        },
      ])[0]!,
    );
  });

  test.each([
    ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
    ValintakoeOsallistuminenTulos.MERKITSEMATTA,
    ValintakoeOsallistuminenTulos.EI_VAADITA,
  ])(
    'clears pisteet when changing osallistuminen from "OSALLISTUI" to "%s"',
    async (newOsallistuminen: ValintakoeOsallistuminenTulos) => {
      const osallistuminen = ValintakoeOsallistuminenTulos.OSALLISTUI;
      const pistetieto = generatePistetiedot([
        {
          tunniste: '2',
          arvo: '8.0',
          osallistuminen,
        },
      ]);
      const actor = initPistesyottoState(pistetieto);
      actor.send({
        type: PisteSyottoEvent.PISTETIETO_CHANGED,
        hakemusOid: '1',
        koeTunniste: '2',
        osallistuminen: newOsallistuminen,
      });
      const changedPistetiedot =
        actor.getSnapshot().context.changedPistetiedot?.[0];

      expect(changedPistetiedot).toMatchObject(
        generatePistetiedot([
          {
            tunniste: '2',
            arvo: '',
            osallistuminen: newOsallistuminen,
          },
        ])[0]!,
      );
    },
  );

  test('updates arvo after emptying when multiple koe', async () => {
    const pistetieto = generatePistetiedot([
      {
        tunniste: '1',
        arvo: '',
        osallistuminen: ValintakoeOsallistuminenTulos.EI_VAADITA,
      },
      {
        tunniste: '2',
        arvo: '9',
        osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
      },
    ]);
    const actor = initPistesyottoState(pistetieto);

    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '1',
      arvo: '8',
    });
    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '1',
      arvo: '',
    });

    let changedPistetiedot = actor.getSnapshot().context.changedPistetiedot;
    expect(changedPistetiedot.length).toEqual(0);
    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '1',
      arvo: '10',
    });

    changedPistetiedot = actor.getSnapshot().context.changedPistetiedot;
    expect(changedPistetiedot.length).toEqual(1);
    expect(changedPistetiedot[0]).toMatchObject(
      generatePistetiedot([
        {
          tunniste: '1',
          arvo: '10',
          osallistuminen: ValintakoeOsallistuminenTulos.EI_VAADITA,
        },
      ])[0]!,
    );
  });

  test('changes multiple koe pisteet for same pistetieto', async () => {
    const pistetieto = generatePistetiedot([
      {
        tunniste: '1',
        arvo: '5',
        osallistuminen: ValintakoeOsallistuminenTulos.EI_VAADITA,
      },
      {
        tunniste: '2',
        arvo: '9',
        osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
      },
    ]);
    const actor = initPistesyottoState(pistetieto);
    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '1',
      arvo: '8',
    });

    let changedPistetiedot = actor.getSnapshot().context.changedPistetiedot;

    expect(changedPistetiedot.length).toEqual(1);
    expect(changedPistetiedot[0]).toMatchObject(
      generatePistetiedot([
        {
          tunniste: '1',
          arvo: '8',
          osallistuminen: ValintakoeOsallistuminenTulos.EI_VAADITA,
        },
      ])[0]!,
    );

    actor.send({
      type: PisteSyottoEvent.PISTETIETO_CHANGED,
      hakemusOid: '1',
      koeTunniste: '2',
      arvo: '10',
    });

    changedPistetiedot = actor.getSnapshot().context.changedPistetiedot;

    expect(changedPistetiedot.length).toEqual(2);
    expect(changedPistetiedot).toEqual(
      generatePistetiedot([
        {
          tunniste: '1',
          arvo: '8',
          osallistuminen: ValintakoeOsallistuminenTulos.EI_VAADITA,
        },
        {
          tunniste: '2',
          arvo: '10',
          osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
        },
      ]),
    );
  });
});
