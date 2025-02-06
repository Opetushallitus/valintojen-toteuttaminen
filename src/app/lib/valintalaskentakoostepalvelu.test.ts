import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { client } from './http-client';
import VALINTAKOKEET from '@tests/e2e/fixtures/valintakokeet.json';
import VALINTAKOEOSALLISTUMISET from '@tests/e2e/fixtures/valintakoeosallistumiset.json';
import HAKEMUKSET from '@tests/e2e/fixtures/hakeneet.json';
import {
  getValintakoekutsutData,
  luoEiHyvaksymiskirjeetPDF,
  luoHyvaksymiskirjeetPDF,
  luoOsoitetarratHakukohteessaHyvaksytyille,
} from './valintalaskentakoostepalvelu';
import { Language } from './localization/localization-types';
import { Hakukohde } from './types/kouta-types';

const HAKEMUKSET_BY_OID = {
  '1.2.246.562.11.00000000000001796027': {
    hakemusOid: '1.2.246.562.11.00000000000001796027',
    hakijaOid: '1.2.246.562.24.69259807406',
    etunimet: 'Ruhtinas',
    sukunimi: 'Nukettaja',
    hakijanNimi: 'Nukettaja Ruhtinas',
    asiointikieliKoodi: 'fi',
    henkilotunnus: undefined,
    lahiosoite: 'Kuoppamäki 905',
    postinumero: '00100',
  },
  '1.2.246.562.11.00000000000001793706': {
    hakemusOid: '1.2.246.562.11.00000000000001793706',
    hakijaOid: '1.2.246.562.24.25732574711',
    etunimet: 'Kreivi',
    sukunimi: 'Dacula',
    hakijanNimi: 'Dacula Kreivi',
    asiointikieliKoodi: 'sv',
    henkilotunnus: '101172-979F',
    lahiosoite: 'Rämsöönranta 183',
    postinumero: '00100',
  },
  '1.2.246.562.11.00000000000001790371': {
    hakemusOid: '1.2.246.562.11.00000000000001790371',
    hakijaOid: '1.2.246.562.24.14598775927',
    etunimet: 'Puru',
    sukunimi: 'Purukumi',
    hakijanNimi: 'Purukumi Puru',
    asiointikieliKoodi: 'fi',
    henkilotunnus: '210988-9151',
    lahiosoite: 'Kuoppamäki 992',
    postinumero: '00100',
  },
  '1.2.246.562.11.00000000000001543832': {
    hakemusOid: '1.2.246.562.11.00000000000001543832',
    hakijaOid: '1.2.246.562.24.30476885816',
    etunimet: 'Haamu',
    sukunimi: 'Hui',
    hakijanNimi: 'Hui Haamu',
    asiointikieliKoodi: 'en',
    henkilotunnus: '021016A934L',
    lahiosoite: 'Yläpääntie 875',
    postinumero: '00100',
  },
};

const HAKUKOHDE: Hakukohde = {
  oid: '1.2.246.562.20.00000000000000045109',
  hakuOid: '1.2.246.562.29.00000000000000045103',
  tarjoajaOid: '1.2.246.562.10.00000000000000045100',
  nimi: { fi: 'Palindromien vääntäjien erikoistuminen' },
  opetuskielet: new Set<Language>(['fi']),
  organisaatioNimi: { fi: 'Saippuakauppiaitten innostuneet sonnit' },
  organisaatioOid: '1.2.3.4.5.6',
  jarjestyspaikkaHierarkiaNimi: { fi: 'Saippuakauppa' },
  voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
};

describe('getValintakoekutsutData', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Returns empty data when no valintakokeet', async () => {
    const clientSpy = vi.spyOn(client, 'get');
    clientSpy.mockImplementationOnce((url) => {
      const urlString = url.toString();
      if (urlString.endsWith('/valintakoe')) {
        //valintakokeet
        return Promise.resolve({
          headers: new Headers(),
          data: [] as unknown,
        });
      }
      return Promise.reject();
    });
    const result = await getValintakoekutsutData({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid: '1.2.246.562.20.00000000000000045105',
    });
    expect(result).toEqual({
      valintakokeet: [],
      hakemuksetByOid: {},
      valintakoeOsallistumiset: [],
    });
  });
  test('Returns active valintakokeet with hakemukset and valintakoeosallistumiset', async () => {
    const clientSpy = vi.spyOn(client, 'get');
    clientSpy.mockImplementation((url) => {
      const urlString = url.toString();
      if (urlString.endsWith('/valintakoe')) {
        //valintakokeet
        return Promise.resolve({
          headers: new Headers(),
          data: VALINTAKOKEET,
        });
      } else if (
        urlString.includes(
          '/valintalaskentakoostepalvelu/resources/valintakoe/hakutoive/',
        )
      ) {
        //valintakoeosallistumiset
        return Promise.resolve({
          headers: new Headers(),
          data: VALINTAKOEOSALLISTUMISET,
        });
      } else if (
        urlString.includes('/lomake-editori/api/external/valinta-ui')
      ) {
        // hakemukset
        return Promise.resolve({
          headers: new Headers(),
          data: HAKEMUKSET,
        });
      }
      return Promise.reject();
    });
    const result = await getValintakoekutsutData({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid: '1.2.246.562.20.00000000000000045105',
    });
    expect(result).toEqual(
      expect.objectContaining({
        valintakokeet: VALINTAKOKEET,
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset: VALINTAKOEOSALLISTUMISET,
      }),
    );
  });

  test('Fetches hakemus missing from hakukohde', async () => {
    const clientSpy = vi.spyOn(client, 'get');

    clientSpy.mockImplementation((url) => {
      const urlString = url.toString();
      if (urlString.endsWith('/valintakoe')) {
        //valintakokeet
        return Promise.resolve({
          headers: new Headers(),
          data: VALINTAKOKEET,
        });
      } else if (
        urlString.includes(
          '/valintalaskentakoostepalvelu/resources/valintakoe/hakutoive/',
        )
      ) {
        //valintakoeosallistumiset
        return Promise.resolve({
          headers: new Headers(),
          data: VALINTAKOEOSALLISTUMISET,
        });
      } else if (
        urlString.includes('/lomake-editori/api/external/valinta-ui')
      ) {
        if (
          urlString.includes('hakemusOids=1.2.246.562.11.00000000000001543832')
        ) {
          return Promise.resolve({
            headers: new Headers(),
            data: HAKEMUKSET.filter(
              (h) => h.oid === '1.2.246.562.11.00000000000001543832',
            ),
          });
        }
        return Promise.resolve({
          headers: new Headers(),
          data: HAKEMUKSET.filter(
            (h) => h.oid !== '1.2.246.562.11.00000000000001543832',
          ),
        });
      }
      return Promise.reject();
    });
    const result = await getValintakoekutsutData({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid: '1.2.246.562.20.00000000000000045105',
    });
    expect(result).toEqual(
      expect.objectContaining({
        valintakokeet: VALINTAKOKEET,
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset: VALINTAKOEOSALLISTUMISET,
      }),
    );
  });
});

describe('letters and poststamps', () => {
  beforeEach(() => {
    const processDocumentSpy = vi.spyOn(client, 'get');

    processDocumentSpy.mockImplementationOnce((url) => {
      if (url.toString().includes('/dokumenttiprosessi')) {
        return Promise.resolve({
          headers: new Headers(),
          data: {
            dokumenttiId: 'document-id',
            poikkeukset: [],
            varoitukset: [],
            kokonaistyo: {
              valmis: true,
            },
          },
        });
      }
      return Promise.reject();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Creates acceptance letters process and returns document id to poll', async () => {
    const clientSpy = vi.spyOn(client, 'post');
    clientSpy.mockImplementationOnce((url) => {
      if (url.toString().includes('/hyvaksymiskirjeet')) {
        return Promise.resolve({
          headers: new Headers(),
          data: { id: 'process-id' },
        });
      }
      return Promise.reject();
    });
    const result = await luoHyvaksymiskirjeetPDF({
      hakemusOids: ['1.2.246.562.11.00000000000001796027'],
      sijoitteluajoId: 'sijoitteluajo-id',
      hakukohde: HAKUKOHDE,
      letterBody: 'saippuakivikauppias',
      deadline: new Date(),
      onlyForbidden: false,
    });
    expect(result).toBe('document-id');
  });

  test('Creates non-acceptance letters process and returns document id to poll', async () => {
    const clientSpy = vi.spyOn(client, 'post');
    clientSpy.mockImplementationOnce((url) => {
      if (url.toString().includes('/hakukohteessahylatyt')) {
        return Promise.resolve({
          headers: new Headers(),
          data: { id: 'process-id' },
        });
      }
      return Promise.reject();
    });
    const result = await luoEiHyvaksymiskirjeetPDF({
      sijoitteluajoId: 'sijoitteluajo-id',
      hakukohde: HAKUKOHDE,
      letterBody: 'saippuakivikauppias',
    });
    expect(result).toBe('document-id');
  });

  test('Creates poststamps process and returns document id to poll', async () => {
    const clientSpy = vi.spyOn(client, 'post');
    clientSpy.mockImplementationOnce((url) => {
      if (url.toString().includes('/osoitetarrat')) {
        return Promise.resolve({
          headers: new Headers(),
          data: { id: 'process-id' },
        });
      }
      return Promise.reject();
    });
    const result = await luoOsoitetarratHakukohteessaHyvaksytyille({
      sijoitteluajoId: 'sijoitteluajo-id',
      hakukohde: HAKUKOHDE,
    });
    expect(result).toBe('document-id');
  });
});
