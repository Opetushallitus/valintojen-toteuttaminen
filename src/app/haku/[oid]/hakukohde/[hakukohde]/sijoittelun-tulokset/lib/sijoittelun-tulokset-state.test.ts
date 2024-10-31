import { expect, test, vi, describe, afterEach, beforeEach } from 'vitest';
import { client } from '@/app/lib/http-client';
import { createActor, waitFor } from 'xstate';
import {
  createSijoittelunTuloksetMachine,
  SijoittelunTuloksetEvents,
  SijoittelunTuloksetStates,
} from './sijoittelun-tulokset-state';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';

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
      naytetaanVastaanottoTieto: true,
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
      naytetaanVastaanottoTieto: true,
      onkoMuuttunutViimeSijoittelussa: false,
      tasasijaJonosija: 1,
      tila: SijoittelunTila.VARALLA,
      valintatapajonoOid: 'jono-oid',
      varasijanNumero: 1,
    },
  ];

  const toastFn = vi.fn();
  let actor = createActor(
    createSijoittelunTuloksetMachine(
      'hakukohde-oid',
      'jono-oid',
      hakemukset,
      '',
      toastFn,
    ),
  );

  beforeEach(() => {
    actor.start();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    actor = createActor(
      createSijoittelunTuloksetMachine(
        'hakukohde-oid',
        'jono-oid',
        hakemukset,
        '',
        toastFn,
      ),
    );
  });

  test('saving without changes creates error toast', async () => {
    expect(toastFn).not.toHaveBeenCalledOnce();
    actor.send({ type: SijoittelunTuloksetEvents.UPDATE });
    expect(toastFn).toHaveBeenCalledWith({
      key: `sijoittelun-tulokset-update-failed-for-hakukohde-oid-jono-oid`,
      message: 'virhe.eimuutoksia',
      type: 'error',
    });
  });

  test('saving changes successfully shows success toast', async () => {
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: {} }),
    );
    vi.spyOn(client, 'patch').mockImplementationOnce(() =>
      Promise.resolve({ headers: new Headers(), data: [] }),
    );
    actor.send({
      type: SijoittelunTuloksetEvents.ADD_CHANGED_HAKEMUS,
      hakemusOid: 'hakemus-2',
      vastaanottoTila: VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
    });
    let state = await waitFor(actor, (state) =>
      state.matches(SijoittelunTuloksetStates.IDLE),
    );
    expect(state.context.changedHakemukset.length).toEqual(1);
    actor.send({ type: SijoittelunTuloksetEvents.UPDATE });
    state = await waitFor(actor, (state) =>
      state.matches(SijoittelunTuloksetStates.IDLE),
    );
    expect(toastFn).toHaveBeenCalledWith({
      key: `sijoittelun-tulokset-updated-for-hakukohde-oid-jono-oid`,
      message: 'sijoittelun-tulokset.valmis',
      type: 'success',
    });
    expect(state.context.changedHakemukset.length).toEqual(0);
  });
});
