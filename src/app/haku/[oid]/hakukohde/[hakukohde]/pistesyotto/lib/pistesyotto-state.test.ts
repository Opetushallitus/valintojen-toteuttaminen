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

describe('createPisteMachine', () => {
  test('should return a machine that updates the pistetiedot', async () => {
    const pistetiedot: HakemuksenPistetiedot = {
      hakijanNimi: 'Meikäläinen Matti',
      hakemusOid: '1',
      hakijaOid: '3',
      etunimet: 'Matti',
      sukunimi: 'Meikäläinen',
      valintakokeenPisteet: [
        {
          osallistuminenTunniste: 'paasykoe_1234',
          tunniste: '2',
          arvo: '8.0',
          osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
        },
      ],
    };
    const machine = createPisteMachine('hakukohde-oid', [pistetiedot]);
    const actor = createActor(machine);
    actor.start();

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

    expect(changedPistetiedot).toMatchObject({
      ...pistetiedot,
      valintakokeenPisteet: [
        {
          arvo: '',
          osallistuminenTunniste: 'paasykoe_1234',
          tunniste: '2',
          osallistuminen: ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
        },
      ],
    });
  });

  //   test('should return a machine that saves the pistetiedot', async () => {
  //     const pistetiedot: HakemuksenPistetiedot[] = [
  //       {
  //         hakemusOid: '1',
  //         valintakokeenPisteet: {},
  //       },
  //     ];
  //     const machine = createPisteMachine('hakukohde-oid', pistetiedot);
  //     const actor = createActor(machine);

  //     actor.send({
  //       type: PisteSyottoEvent.CHANGE_PISTETIETO,
  //       hakemusOid: '1',
  //       pisteet: { koe1: 10 },
  //     });
  //     await waitFor(actor, LaskentaStates.IDLE);

  //     actor.send({ type: PisteSyottoEvent.SAVE });
  //     await waitFor(actor, LaskentaStates.IDLE);

  //     expect(actor.state.context.pistetiedot).toEqual([
  //       {
  //         hakemusOid: '1',
  //         valintakokeenPisteet: { koe1: 10 },
  //       },
  //     ]);
  //   });
});
