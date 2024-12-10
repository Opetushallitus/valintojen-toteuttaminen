import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminenTulos,
} from '@/app/lib/types/laskenta-types';
import { describe, expect, test } from 'vitest';
import {
  createPisteMachine,
  PisteSyottoEvent,
  PisteSyottoStates,
} from './pistesyotto-state';
import { createActor, waitFor } from 'xstate';

type GeneratePistetiedotProps = {
  arvo: string;
  osallistuminen: ValintakoeOsallistuminenTulos;
};

const generatePistetiedot = ({
  osallistuminen,
  arvo,
}: GeneratePistetiedotProps) => ({
  hakijanNimi: 'Meikäläinen Matti',
  hakemusOid: '1',
  hakijaOid: '3',
  etunimet: 'Matti',
  sukunimi: 'Meikäläinen',
  valintakokeenPisteet: [
    {
      osallistuminenTunniste: 'paasykoe_1234',
      tunniste: '2',
      arvo,
      osallistuminen,
    },
  ],
});

const initPistesyottoState = (pistetiedot: HakemuksenPistetiedot) => {
  const machine = createPisteMachine('hakukohde-oid', [pistetiedot]);
  const actor = createActor(machine);
  actor.start();
  return actor;
};

describe('createPisteMachine', () => {
  test('should return a machine that updates the pistetiedot', async () => {
    const pistetieto = generatePistetiedot({
      arvo: '8.0',
      osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
    });
    const actor = initPistesyottoState(pistetieto);
    actor.send({
      type: PisteSyottoEvent.ADD_CHANGED_PISTETIETO,
      hakemusOid: '1',
      koeTunniste: '2',
      osallistuminen: ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
      arvo: '',
    });
    await waitFor(actor, (state) => state.matches(PisteSyottoStates.IDLE));

    const changedPistetiedot =
      actor.getSnapshot().context.changedPistetiedot?.[0];

    expect(changedPistetiedot).toMatchObject(pistetieto);
  });

  test('Change osallistuminen from "MERKITSEMATTA" to "OSALLISTUI", when changing pisteet', async () => {
    const pistetieto = generatePistetiedot({
      arvo: '',
      osallistuminen: ValintakoeOsallistuminenTulos.MERKITSEMATTA,
    });
    const actor = initPistesyottoState(pistetieto);
    actor.send({
      type: PisteSyottoEvent.ADD_CHANGED_PISTETIETO,
      hakemusOid: '1',
      koeTunniste: '2',
      arvo: '8.0',
    });
    await waitFor(actor, (state) => state.matches(PisteSyottoStates.IDLE));
    const changedPistetiedot =
      actor.getSnapshot().context.changedPistetiedot?.[0];
    expect(changedPistetiedot).toMatchObject(
      generatePistetiedot({
        arvo: '8.0',
        osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
      }),
    );
  });

  test.each([
    ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
    ValintakoeOsallistuminenTulos.MERKITSEMATTA,
    ValintakoeOsallistuminenTulos.EI_VAADITA,
  ])(
    'Clear pisteet when changing osallistuminen from "OSALLISTUI" to "%s"',
    async (newOsallistuminen: ValintakoeOsallistuminenTulos) => {
      const osallistuminen = ValintakoeOsallistuminenTulos.OSALLISTUI;
      const pistetieto = generatePistetiedot({
        arvo: '8.0',
        osallistuminen,
      });
      const actor = initPistesyottoState(pistetieto);
      actor.send({
        type: PisteSyottoEvent.ADD_CHANGED_PISTETIETO,
        hakemusOid: '1',
        koeTunniste: '2',
        osallistuminen: newOsallistuminen,
      });
      await waitFor(actor, (state) => state.matches(PisteSyottoStates.IDLE));
      const changedPistetiedot =
        actor.getSnapshot().context.changedPistetiedot?.[0];

      expect(changedPistetiedot).toMatchObject(
        generatePistetiedot({
          arvo: '',
          osallistuminen: newOsallistuminen,
        }),
      );
    },
  );
});
