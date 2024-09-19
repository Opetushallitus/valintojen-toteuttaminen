import { expect, test, vi, describe, afterEach, beforeEach } from 'vitest';
import {
  createLaskentaMachine,
  LaskentaEvents,
  LaskentaStates,
  StartLaskentaParams,
} from './laskenta-state';
import { client } from '@/app/lib/http-client';
import { Tila } from '@/app/lib/types/kouta-types';
import { translateName } from '@/app/lib/localization/translation-utils';
import { createActor, waitFor } from 'xstate';

describe('Laskenta states', async () => {
  const LASKENTAPARAMS: StartLaskentaParams = {
    haku: {
      oid: 'haku-oid',
      alkamisKausiKoodiUri: '',
      alkamisVuosi: 2024,
      hakukohteita: 1,
      hakutapaKoodiUri: '',
      kohdejoukkoKoodiUri: '',
      nimi: { fi: 'Haku' },
      tila: Tila.JULKAISTU,
    },
    hakukohde: {
      oid: 'hakukohde-oid',
      nimi: { fi: 'hakukohde' },
      jarjestyspaikkaHierarkiaNimi: { fi: 'Paikka' },
      organisaatioNimi: {},
      organisaatioOid: 'organisaatio-oid',
    },
    sijoitellaanko: false,
    translateEntity: translateName,
  };

  let actor = createActor(createLaskentaMachine(LASKENTAPARAMS, vi.fn()));

  beforeEach(() => {
    actor.start();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    actor = createActor(createLaskentaMachine(LASKENTAPARAMS, vi.fn()));
  });

  test('starts calculation and initializes polling', async () => {
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      buildDummyLaskentaStart(),
    );
    vi.spyOn(client, 'get').mockImplementation(() => buildSeurantaTiedot());
    await actor.send({ type: LaskentaEvents.START });
    await actor.send({ type: LaskentaEvents.CONFIRM });
    const state = await waitFor(actor, (state) =>
      state.matches({
        [LaskentaStates.PROCESSING]: LaskentaStates.PROCESSING_WAITING,
      }),
    );
    expect(state.context.laskenta.runningLaskenta?.loadingUrl).toEqual(
      'urlmistatulosladataan',
    );
    expect(
      state.context.laskenta.runningLaskenta?.startedNewLaskenta,
    ).toBeTruthy();
    expect(state.context.seurantaTiedot?.tila).toEqual('MENEILLAAN');
    expect(state.context.seurantaTiedot?.hakukohteitaYhteensa).toEqual(1);
    expect(state.context.seurantaTiedot?.hakukohteitaValmiina).toEqual(0);
    expect(state.context.seurantaTiedot?.hakukohteitaKeskeytetty).toEqual(0);
  });

  test('starts and completes calculation', async () => {
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      buildDummyLaskentaStart(),
    );
    vi.spyOn(client, 'get').mockImplementation(() =>
      buildSeurantaTiedot(true, 1),
    );
    await actor.send({ type: LaskentaEvents.START });
    await actor.send({ type: LaskentaEvents.CONFIRM });
    const state = await waitFor(actor, (state) =>
      state.matches(LaskentaStates.IDLE),
    );
    expect(state.context.laskenta.runningLaskenta?.loadingUrl).toEqual(
      'urlmistatulosladataan',
    );
    expect(
      state.context.laskenta.runningLaskenta?.startedNewLaskenta,
    ).toBeTruthy();
    expect(state.context.seurantaTiedot?.tila).toEqual('VALMIS');
    expect(state.context.seurantaTiedot?.hakukohteitaYhteensa).toEqual(1);
    expect(state.context.seurantaTiedot?.hakukohteitaValmiina).toEqual(1);
    expect(state.context.seurantaTiedot?.hakukohteitaKeskeytetty).toEqual(0);
    expect(state.context.laskenta.calculatedTime).not.toBeNull();
  });

  test('starts calculation but stops to error', async () => {
    vi.spyOn(client, 'post').mockRejectedValueOnce(
      () => new Error('testerror'),
    );
    await actor.send({ type: LaskentaEvents.START });
    await actor.send({ type: LaskentaEvents.CONFIRM });
    const state = await waitFor(actor, (state) =>
      state.matches(LaskentaStates.IDLE),
    );
    expect(state.context.error).toBeDefined();
  });

  test('starts calculation and calculation fails', async () => {
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      buildDummyLaskentaStart(),
    );
    vi.spyOn(client, 'get').mockImplementationOnce(() =>
      buildSeurantaTiedot(true, 0, 1),
    );
    await actor.send({ type: LaskentaEvents.START });
    await actor.send({ type: LaskentaEvents.CONFIRM });
    const state = await waitFor(actor, (state) =>
      state.matches(LaskentaStates.IDLE),
    );
    expect(state.context.laskenta.runningLaskenta?.loadingUrl).toEqual(
      'urlmistatulosladataan',
    );
    expect(
      state.context.laskenta.runningLaskenta?.startedNewLaskenta,
    ).toBeTruthy();
    expect(state.context.seurantaTiedot?.tila).toEqual('VALMIS');
    expect(state.context.seurantaTiedot?.hakukohteitaYhteensa).toEqual(1);
    expect(state.context.seurantaTiedot?.hakukohteitaValmiina).toEqual(0);
    expect(state.context.seurantaTiedot?.hakukohteitaKeskeytetty).toEqual(1);
    expect(state.context.laskenta.calculatedTime).toBeUndefined();
  });
});

const buildDummyLaskentaStart = () => {
  const laskenta = {
    latausUrl: 'urlmistatulosladataan',
    lisatiedot: { luotiinkoUusiLaskenta: true },
  };
  return Promise.resolve({ headers: new Headers(), data: laskenta });
};

const buildSeurantaTiedot = (
  ready = false,
  hakukohteitaValmiina = 0,
  hakukohteitaKeskeytetty = 0,
) => {
  const seuranta = {
    tila: ready ? 'VALMIS' : 'MENEILLAAN',
    hakukohteitaYhteensa: 1,
    hakukohteitaValmiina,
    hakukohteitaKeskeytetty,
  };
  return Promise.resolve({ headers: new Headers(), data: seuranta });
};
