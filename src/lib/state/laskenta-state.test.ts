import { expect, test, vi, describe, afterEach, beforeEach } from 'vitest';
import {
  createLaskentaMachine,
  LaskentaEventType,
  LaskentaState,
  LaskentaParams,
} from './laskenta-state';
import { client } from '@/lib/http-client';
import { Tila } from '@/lib/kouta/kouta-types';
import { createActor, waitFor } from 'xstate';
import { range } from 'remeda';
import {
  convertConfiguration,
  setConfiguration,
} from '@/lib/configuration/client-configuration';
import { buildConfiguration } from '@/lib/configuration/server-configuration';

const LASKENTA_URL = 'urlmistatulosladataan';

describe('Laskenta state', async () => {
  const LASKENTAPARAMS: LaskentaParams = {
    haku: {
      oid: 'haku-oid',
      alkamisKausiKoodiUri: '',
      alkamisVuosi: 2024,
      hakukohteita: 1,
      hakutapaKoodiUri: '',
      kohdejoukkoKoodiUri: '',
      nimi: { fi: 'Haku' },
      tila: Tila.JULKAISTU,
      organisaatioOid: 'organisaatio-oid',
    },
    hakukohteet: [
      {
        oid: 'hakukohde-oid',
        hakuOid: 'haku-oid',
        nimi: { fi: 'hakukohde' },
        jarjestyspaikkaHierarkiaNimi: { fi: 'Paikka' },
        organisaatioNimi: {},
        organisaatioOid: 'organisaatio-oid',
        voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
        tarjoajaOid: 'tarjoaja-oid',
        opetuskielet: new Set(['fi']),
      },
    ],
  };

  let actor = createActor(createLaskentaMachine(vi.fn()));

  beforeEach(() => {
    setConfiguration(convertConfiguration(buildConfiguration()));
    actor.start();
    actor.send({ type: LaskentaEventType.SET_PARAMS, params: LASKENTAPARAMS });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    actor = createActor(createLaskentaMachine(vi.fn()));
  });

  test('starts calculation and initializes polling', async () => {
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      buildDummyLaskentaStart(),
    );
    vi.spyOn(client, 'get').mockImplementation(() => buildSeurantaTiedot());
    await actor.send({ type: LaskentaEventType.START });
    actor.send({ type: LaskentaEventType.CONFIRM });
    const state = await waitFor(actor, (s) =>
      s.matches({
        [LaskentaState.PROCESSING]: LaskentaState.PROCESSING_WAITING,
      }),
    );
    expect(state.context.startedLaskenta?.loadingUrl).toEqual(LASKENTA_URL);
    expect(state.context.startedLaskenta?.startedNewLaskenta).toBeTruthy();
    expect(state.context.seurantaTiedot?.tila).toEqual('MENEILLAAN');
    expect(state.context.seurantaTiedot?.hakukohteitaYhteensa).toEqual(1);
    expect(state.context.seurantaTiedot?.hakukohteitaValmiina).toEqual(0);
    expect(state.context.seurantaTiedot?.hakukohteitaKeskeytetty).toEqual(0);
  });

  test('starts and completes calculation', async () => {
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      buildDummyLaskentaStart(),
    );
    vi.spyOn(client, 'get').mockImplementation((url) => {
      if (url.toString().includes('seuranta')) {
        return buildSeurantaTiedot(true, 1);
      } else if (url.toString().includes('yhteenveto')) {
        return buildYhteenveto('VALMIS', 1);
      }
      return Promise.reject();
    });
    actor.send({ type: LaskentaEventType.START });
    actor.send({ type: LaskentaEventType.CONFIRM });
    const state = await waitFor(actor, (s) => s.matches(LaskentaState.IDLE));
    expect(state.context.startedLaskenta?.loadingUrl).toEqual(LASKENTA_URL);
    expect(state.context.startedLaskenta?.startedNewLaskenta).toBeTruthy();
    expect(state.context.seurantaTiedot?.tila).toEqual('VALMIS');
    expect(state.context.seurantaTiedot?.hakukohteitaYhteensa).toEqual(1);
    expect(state.context.seurantaTiedot?.hakukohteitaValmiina).toEqual(1);
    expect(state.context.seurantaTiedot?.hakukohteitaKeskeytetty).toEqual(0);
    expect(state.context.calculatedTime).not.toBeNull();
  });

  test('starts calculation but stops to error', async () => {
    vi.spyOn(client, 'post').mockRejectedValueOnce(
      () => new Error('testerror'),
    );
    actor.send({ type: LaskentaEventType.START });
    actor.send({ type: LaskentaEventType.CONFIRM });
    const state = await waitFor(actor, (s) => s.matches(LaskentaState.IDLE));
    expect(state.context.error).toBeDefined();
  });

  test('starts calculation and calculation fails', async () => {
    vi.spyOn(client, 'post').mockImplementationOnce(() =>
      buildDummyLaskentaStart(),
    );
    vi.spyOn(client, 'get').mockImplementationOnce(() =>
      buildSeurantaTiedot(true, 0, 1),
    );
    actor.send({ type: LaskentaEventType.START });
    actor.send({ type: LaskentaEventType.CONFIRM });
    const state = await waitFor(actor, (s) => s.matches(LaskentaState.IDLE));
    expect(state.context.startedLaskenta?.loadingUrl).toEqual(LASKENTA_URL);
    expect(state.context.startedLaskenta?.startedNewLaskenta).toBeTruthy();
    expect(state.context.seurantaTiedot?.tila).toEqual('VALMIS');
    expect(state.context.seurantaTiedot?.hakukohteitaYhteensa).toEqual(1);
    expect(state.context.seurantaTiedot?.hakukohteitaValmiina).toEqual(0);
    expect(state.context.seurantaTiedot?.hakukohteitaKeskeytetty).toEqual(1);
    expect(state.context.calculatedTime).toBeNull();
  });
});

const buildDummyLaskentaStart = () => {
  const laskenta = {
    latausUrl: LASKENTA_URL,
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

const buildYhteenveto = (
  tila: 'VALMIS' | 'PERUUTETTU',
  hakukohteitaValmiina = 0,
  hakukohteitaKeskeytetty = 0,
) => {
  const yhteenvetoValmiit = range(0, hakukohteitaValmiina).map(
    (hakukohdeOid) => ({
      hakukohdeOid,
      tila: 'VALMIS',
    }),
  );

  const yhteenvatKeskeytetty = range(0, hakukohteitaKeskeytetty).map(
    (hakukohdeOid) => ({
      hakukohdeOid,
      tila: 'VIRHE',
    }),
  );

  const yhteenveto = {
    hakukohteet: [...yhteenvetoValmiit, ...yhteenvatKeskeytetty],
    tila,
  };

  return Promise.resolve({ headers: new Headers(), data: yhteenveto });
};
