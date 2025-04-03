import { expect, test, vi, describe, afterEach } from 'vitest';
import { client } from '@/lib/http-client';
import { createActor, waitFor } from 'xstate';
import { sijoittelunTuloksetMachine } from './sijoittelun-tulokset-state';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import {
  SijoittelunTuloksetEventType,
  SijoittelunTuloksetState,
  SijoittelunTulosActorRef,
} from './sijoittelun-tulokset-state';

vi.mock('@/components/modals/global-modal', () => ({
  showModal: vi.fn(),
  createModal: vi.fn(),
}));

const waitIdle = (actor: SijoittelunTulosActorRef) =>
  waitFor(actor, (state) => state.matches(SijoittelunTuloksetState.IDLE));

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
      vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      pisteet: 100,
      jonosija: 1,
      julkaistavissa: true,
      onkoMuuttunutViimeSijoittelussa: false,
      tasasijaJonosija: 1,
      tila: SijoittelunTila.HYVAKSYTTY,
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
      vastaanottotila: VastaanottoTila.KESKEN,
      pisteet: 9,
      jonosija: 2,
      julkaistavissa: true,
      onkoMuuttunutViimeSijoittelussa: false,
      tasasijaJonosija: 1,
      tila: SijoittelunTila.VARALLA,
      valintatapajonoOid: 'jono-oid',
      varasijanNumero: 1,
    },
  ];

  const toastFn = vi.fn();
  const onUpdatedFn = vi.fn();

  const createActorLogic = () => {
    const actor = createActor(sijoittelunTuloksetMachine);
    actor.start();
    actor.send({
      type: SijoittelunTuloksetEventType.RESET,
      params: {
        hakukohdeOid: 'hakukohde-oid',
        valintatapajonoOid: 'jono-oid',
        hakemukset: hakemukset,
        lastModified: '',
        addToast: toastFn,
        onUpdated: onUpdatedFn,
      },
    });
    return actor;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('saving without changes creates error toast', async () => {
    const actor = createActorLogic();
    expect(toastFn).not.toHaveBeenCalled();
    actor.send({ type: SijoittelunTuloksetEventType.UPDATE });
    expect(toastFn).toHaveBeenCalledWith({
      key: 'sijoittelun-tulokset-update-failed-for-hakukohde-oid-jono-oid',
      message: 'virhe.eimuutoksia',
      type: 'error',
    });
  });

  test('saving changes successfully shows success toast', async () => {
    const actor = createActorLogic();
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: {} }),
    );
    vi.spyOn(client, 'patch').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: [] }),
    );
    actor.send({
      type: SijoittelunTuloksetEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      vastaanottotila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });
    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);
    actor.send({ type: SijoittelunTuloksetEventType.UPDATE });
    state = await waitIdle(actor);
    expect(toastFn).toHaveBeenCalledWith({
      key: 'sijoittelun-tulokset-updated-for-hakukohde-oid-jono-oid',
      message: 'sijoittelun-tulokset.valmis',
      type: 'success',
    });
    expect(onUpdatedFn).toHaveBeenCalled();
  });

  test('removes item from changedhakemukset when changing values back to original', async () => {
    const actor = createActorLogic();
    actor.send({
      type: SijoittelunTuloksetEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      vastaanottotila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });

    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);

    actor.send({
      type: SijoittelunTuloksetEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      vastaanottotila: VastaanottoTila.KESKEN,
    });

    state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(0);
  });

  test('mass update preserves other changes and modifies original hakemukset on success', async () => {
    const actor = createActorLogic();
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: {} }),
    );
    vi.spyOn(client, 'patch').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: [] }),
    );
    actor.send({
      type: SijoittelunTuloksetEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      ehdollisestiHyvaksyttavissa: true,
    });

    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);

    actor.send({
      type: SijoittelunTuloksetEventType.MASS_UPDATE,
      hakemusOids: new Set(['hakemus-1', 'hakemus-2']),
      vastaanottotila: VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
    });

    state = await waitIdle(actor);
    expect(onUpdatedFn).toHaveBeenCalled();
  });

  test('Should not call onUpdated when saving everything failed', async () => {
    const actor = createActorLogic();
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
      type: SijoittelunTuloksetEventType.CHANGE,
      hakemusOid: 'hakemus-1',
      vastaanottotila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });
    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);
    actor.send({ type: SijoittelunTuloksetEventType.UPDATE });
    state = await waitIdle(actor);
    expect(onUpdatedFn).not.toHaveBeenCalled();
  });

  test('Should call onUpdated when saving one hakemus succeeded and other failed', async () => {
    const actor = createActorLogic();
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
      type: SijoittelunTuloksetEventType.CHANGE,
      hakemusOid: 'hakemus-1',
      vastaanottotila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });

    actor.send({
      type: SijoittelunTuloksetEventType.CHANGE,
      hakemusOid: 'hakemus-2',
      vastaanottotila: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
    });

    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(2);

    actor.send({ type: SijoittelunTuloksetEventType.UPDATE });
    state = await waitIdle(actor);
    expect(onUpdatedFn).toHaveBeenCalled();
  });
});
