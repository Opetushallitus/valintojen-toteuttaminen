import { expect, test, vi, describe, afterEach } from 'vitest';
import { client } from '@/lib/http-client';
import { createActor, waitFor } from 'xstate';
import { sijoittelunTuloksetMachine } from './sijoittelun-tulokset-state';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  ValinnanTila,
  SijoittelunTulosActorRef,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import {
  ValinnanTulosEventType,
  ValinnanTulosState,
} from '@/lib/state/valinnanTuloksetMachineTypes';
import { setConfiguration } from '@/lib/configuration/client-configuration';
import { buildConfiguration } from '@/lib/configuration/server-configuration';

vi.mock('@/components/modals/global-modal', () => ({
  showModal: vi.fn(),
  createModal: vi.fn(),
}));

buildConfiguration().then(setConfiguration);

const waitIdle = (actor: SijoittelunTulosActorRef) =>
  waitFor(actor, (state) => state.matches(ValinnanTulosState.IDLE));

describe('Sijoittelun tulokset states', async () => {
  const hakemukset: Array<SijoittelunHakemusValintatiedoilla> = [
    {
      hakijaOid: 'hakija-1',
      ehdollisestiHyvaksyttavissa: false,
      hakemusOid: 'hakemus-1',
      hakijanNimi: 'Alan Herätä',
      hakutoive: 1,
      hyvaksyPeruuntunut: false,
      hyvaksyttyHakijaryhmista: [],
      hyvaksyttyHarkinnanvaraisesti: false,
      hyvaksyttyVarasijalta: false,
      ilmoittautumisTila: IlmoittautumisTila.LASNA,
      vastaanottoTila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      pisteet: 100,
      jonosija: 1,
      julkaistavissa: true,
      onkoMuuttunutViimeSijoittelussa: false,
      tasasijaJonosija: 1,
      valinnanTila: ValinnanTila.HYVAKSYTTY,
      valintatapajonoOid: 'jono-oid',
      varasijanNumero: 0,
    },
    {
      hakijaOid: 'hakija-2',
      ehdollisestiHyvaksyttavissa: false,
      hakemusOid: 'hakemus-2',
      hakijanNimi: 'Maksi Tuska',
      hakutoive: 1,
      hyvaksyPeruuntunut: false,
      hyvaksyttyHakijaryhmista: [],
      hyvaksyttyHarkinnanvaraisesti: false,
      hyvaksyttyVarasijalta: false,
      ilmoittautumisTila: IlmoittautumisTila.EI_TEHTY,
      vastaanottoTila: VastaanottoTila.KESKEN,
      pisteet: 9,
      jonosija: 2,
      julkaistavissa: true,
      onkoMuuttunutViimeSijoittelussa: false,
      tasasijaJonosija: 1,
      valinnanTila: ValinnanTila.VARALLA,
      valintatapajonoOid: 'jono-oid',
      varasijanNumero: 1,
    },
  ];

  const createActorLogic = () => {
    const toastFn = vi.fn();
    const onUpdatedFn = vi.fn();
    const actor = createActor(sijoittelunTuloksetMachine);
    actor.start();
    actor.send({
      type: ValinnanTulosEventType.RESET,
      params: {
        hakukohdeOid: 'hakukohde-oid',
        valintatapajonoOid: 'jono-oid',
        hakemukset: hakemukset,
        lastModified: '',
        addToast: toastFn,
        onUpdated: onUpdatedFn,
      },
    });
    return { actor, toastFn, onUpdatedFn };
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('saving without changes creates error toast', async () => {
    const { actor, toastFn } = createActorLogic();
    expect(toastFn).not.toHaveBeenCalled();
    actor.send({ type: ValinnanTulosEventType.UPDATE });
    expect(toastFn).toHaveBeenCalledWith({
      key: 'sijoittelun-tulokset-update-failed-for-hakukohde-oid-jono-oid',
      message: 'virhe.eimuutoksia',
      type: 'error',
    });
  });

  test('saving changes successfully shows a success toast', async () => {
    const { actor, toastFn, onUpdatedFn } = createActorLogic();
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: {} }),
    );
    vi.spyOn(client, 'patch').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: [] }),
    );
    actor.send({
      type: ValinnanTulosEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      vastaanottoTila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });
    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);
    actor.send({ type: ValinnanTulosEventType.UPDATE });
    state = await waitIdle(actor);
    expect(toastFn).toHaveBeenCalledOnce();
    expect(onUpdatedFn).toHaveBeenCalled();
  });

  test('removes item from changedhakemukset when changing values back to original', async () => {
    const { actor } = createActorLogic();
    actor.send({
      type: ValinnanTulosEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      vastaanottoTila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });

    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);

    actor.send({
      type: ValinnanTulosEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      vastaanottoTila: VastaanottoTila.KESKEN,
    });

    state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(0);
  });

  test('mass update calls onUpdated on success', async () => {
    const { actor, onUpdatedFn } = createActorLogic();
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: {} }),
    );
    vi.spyOn(client, 'patch').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: [] }),
    );
    actor.send({
      type: ValinnanTulosEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      ehdollisestiHyvaksyttavissa: true,
    });

    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);

    actor.send({
      type: ValinnanTulosEventType.MASS_UPDATE,
      hakemusOids: new Set(['hakemus-1', 'hakemus-2']),
      vastaanottoTila: VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
    });

    state = await waitIdle(actor);
    expect(onUpdatedFn).toHaveBeenCalled();
  });

  test('Should not call onUpdated when saving everything failed', async () => {
    const { actor, onUpdatedFn } = createActorLogic();
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: {} }),
    );
    vi.spyOn(client, 'patch').mockImplementationOnce(() =>
      Promise.resolve({
        headers: new Headers(),
        data: [
          {
            // saving hakemus-1 fails
            hakemusOid: 'hakemus-1',
          },
        ],
      }),
    );
    actor.send({
      type: ValinnanTulosEventType.CHANGE,
      hakemusOid: 'hakemus-1',
      vastaanottoTila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });
    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);
    actor.send({ type: ValinnanTulosEventType.UPDATE });
    state = await waitIdle(actor);
    expect(onUpdatedFn).not.toHaveBeenCalled();
  });

  test('Should change ilmoittautumistila to EI_TEHTY when changing vastannottotila to KESKEN', async () => {
    const { actor } = createActorLogic();

    actor.send({
      type: ValinnanTulosEventType.CHANGE,
      hakemusOid: 'hakemus-1',
      vastaanottoTila: VastaanottoTila.KESKEN,
    });

    const state = await waitIdle(actor);

    expect(state.context.changedHakemukset.length).toEqual(1);
    expect(state.context.changedHakemukset[0].vastaanottoTila).toEqual(
      VastaanottoTila.KESKEN,
    );
    expect(state.context.changedHakemukset[0].ilmoittautumisTila).toEqual(
      IlmoittautumisTila.EI_TEHTY,
    );
  });

  test('Should call onUpdated when saving one hakemus succeeded and other failed', async () => {
    const { actor, onUpdatedFn } = createActorLogic();
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: {} }),
    );
    vi.spyOn(client, 'patch').mockImplementationOnce(() =>
      Promise.resolve({
        headers: new Headers(),
        data: [
          {
            // saving hakemus-1 fails
            hakemusOid: 'hakemus-1',
          },
        ],
      }),
    );

    actor.send({
      type: ValinnanTulosEventType.CHANGE,
      hakemusOid: 'hakemus-1',
      vastaanottoTila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });

    actor.send({
      type: ValinnanTulosEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      vastaanottoTila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
    });

    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(2);

    actor.send({ type: ValinnanTulosEventType.UPDATE });
    state = await waitIdle(actor);
    expect(onUpdatedFn).toHaveBeenCalled();
  });
});
