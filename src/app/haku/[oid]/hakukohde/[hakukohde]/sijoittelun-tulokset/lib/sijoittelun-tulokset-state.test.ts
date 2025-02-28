import { expect, test, vi, describe, afterEach } from 'vitest';
import { client } from '@/app/lib/http-client';
import { createActor, waitFor } from 'xstate';
import {
  createSijoittelunTuloksetMachine,
  SijoittelunTuloksetEventTypes,
  SijoittelunTuloksetStates,
  SijoittelunTulosActorRef,
} from './sijoittelun-tulokset-state';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';

const waitIdle = (actor: SijoittelunTulosActorRef) =>
  waitFor(actor, (state) => state.matches(SijoittelunTuloksetStates.IDLE));

describe('Sijoittelun tulokset states', async () => {
  const hakemukset: SijoittelunHakemusValintatiedoilla[] = [
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
  let actor: SijoittelunTulosActorRef | null = null;

  const createActorLogic = () => {
    actor = createActor(
      createSijoittelunTuloksetMachine(
        'hakukohde-oid',
        'jono-oid',
        hakemukset,
        '',
        toastFn,
      ),
    );
    actor.start();
    return actor;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('saving without changes creates error toast', async () => {
    const actor = createActorLogic();
    expect(toastFn).not.toHaveBeenCalledOnce();
    actor.send({ type: SijoittelunTuloksetEventTypes.UPDATE });
    expect(toastFn).toHaveBeenCalledWith({
      key: `sijoittelun-tulokset-update-failed-for-hakukohde-oid-jono-oid`,
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
      type: SijoittelunTuloksetEventTypes.ADD_CHANGED_HAKEMUS,
      hakemusOid: 'hakemus-2',
      vastaanottotila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });
    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);
    actor.send({ type: SijoittelunTuloksetEventTypes.UPDATE });
    state = await waitIdle(actor);
    expect(toastFn).toHaveBeenCalledWith({
      key: `sijoittelun-tulokset-updated-for-hakukohde-oid-jono-oid`,
      message: 'sijoittelun-tulokset.valmis',
      type: 'success',
    });
    expect(state.context.changedHakemukset.length).toEqual(0);
  });

  test('removes from changedhakemukset when changing values back to original', async () => {
    const actor = createActorLogic();
    actor.send({
      type: SijoittelunTuloksetEventTypes.ADD_CHANGED_HAKEMUS,
      hakemusOid: 'hakemus-2',
      vastaanottotila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });

    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);

    actor.send({
      type: SijoittelunTuloksetEventTypes.ADD_CHANGED_HAKEMUS,
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
      type: SijoittelunTuloksetEventTypes.ADD_CHANGED_HAKEMUS,
      hakemusOid: 'hakemus-2',
      ehdollisestiHyvaksyttavissa: true,
    });

    let state = await waitIdle(actor);
    expect(state.context.changedHakemukset.length).toEqual(1);

    actor.send({
      type: SijoittelunTuloksetEventTypes.MASS_UPDATE,
      hakemusOids: new Set(['hakemus-1', 'hakemus-2']),
      vastaanottoTila: VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
    });

    state = await waitIdle(actor);

    expect(state.context.hakemukset[0].vastaanottotila).toEqual(
      VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
    );
    expect(state.context.hakemukset[1].vastaanottotila).toEqual(
      VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
    );

    expect(state.context.changedHakemukset.length).toEqual(1);
    expect(state.context.changedHakemukset[0]).toEqual({
      ...hakemukset[1],
      ehdollisestiHyvaksyttavissa: true,
    });
  });
});
