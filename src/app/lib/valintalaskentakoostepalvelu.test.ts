import { afterEach, describe, expect, test, vi } from 'vitest';
import { client, HttpClientResponse, JSONData } from './http-client';
import { getValintakoekutsutData } from './valintalaskentakoostepalvelu';
import { indexBy, prop } from 'remeda';
import VALINTAKOKEET from '@tests/e2e/fixtures/kutsu-valintakokeet.json';
import VALINTAKOEOSALLISTUMISET from '@tests/e2e/fixtures/valintakoeosallistumiset.json';
import HAKEMUKSET from '@tests/e2e/fixtures/hakeneet.json';

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
          headers: {},
          data: [] as unknown,
        } as HttpClientResponse<JSONData>);
      }
      return Promise.reject();
    });
    const result = await getValintakoekutsutData({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid: '1.2.246.562.20.00000000000000045105',
    });
    expect(result).toEqual({
      valintakokeetByTunniste: {},
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
          headers: {},
          data: VALINTAKOKEET,
        } as HttpClientResponse<JSONData>);
      } else if (
        urlString.includes(
          '/valintalaskentakoostepalvelu/resources/valintakoe/hakutoive/',
        )
      ) {
        //valintakoeosallistumiset
        return Promise.resolve({
          headers: {},
          data: VALINTAKOEOSALLISTUMISET,
        } as HttpClientResponse<JSONData>);
      } else if (
        urlString.includes('/lomake-editori/api/external/valinta-ui')
      ) {
        // hakemukset
        return Promise.resolve({
          headers: {},
          data: HAKEMUKSET,
        } as HttpClientResponse<JSONData>);
      }
      return Promise.reject();
    });
    const result = await getValintakoekutsutData({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid: '1.2.246.562.20.00000000000000045105',
    });
    expect(result).toEqual({
      valintakokeetByTunniste: indexBy(
        VALINTAKOKEET.filter((v) => v.aktiivinen),
        prop('selvitettyTunniste'),
      ),
      hakemuksetByOid: {
        '1.2.246.562.11.00000000000001796027': {
          hakemusOid: '1.2.246.562.11.00000000000001796027',
          hakijaOid: '1.2.246.562.24.69259807406',
          etunimet: 'Ruhtinas',
          sukunimi: 'Nukettaja',
          hakijanNimi: 'Nukettaja Ruhtinas',
          asiointikieliKoodi: 'fi',
        },
        '1.2.246.562.11.00000000000001793706': {
          hakemusOid: '1.2.246.562.11.00000000000001793706',
          hakijaOid: '1.2.246.562.24.25732574711',
          etunimet: 'Kreivi',
          sukunimi: 'Dacula',
          hakijanNimi: 'Dacula Kreivi',
          asiointikieliKoodi: 'sv',
        },
        '1.2.246.562.11.00000000000001790371': {
          hakemusOid: '1.2.246.562.11.00000000000001790371',
          hakijaOid: '1.2.246.562.24.14598775927',
          etunimet: 'Puru',
          sukunimi: 'Purukumi',
          hakijanNimi: 'Purukumi Puru',
          asiointikieliKoodi: 'fi',
        },
        '1.2.246.562.11.00000000000001543832': {
          hakemusOid: '1.2.246.562.11.00000000000001543832',
          hakijaOid: '1.2.246.562.24.30476885816',
          etunimet: 'Haamu',
          sukunimi: 'Hui',
          hakijanNimi: 'Hui Haamu',
          asiointikieliKoodi: 'en',
        },
      },
      valintakoeOsallistumiset: VALINTAKOEOSALLISTUMISET,
    });
  });

  test('Fetches hakemus missing from hakukohde', async () => {
    const clientSpy = vi.spyOn(client, 'get');

    clientSpy.mockImplementation((url) => {
      const urlString = url.toString();
      if (urlString.endsWith('/valintakoe')) {
        //valintakokeet
        return Promise.resolve({
          headers: {},
          data: VALINTAKOKEET,
        } as HttpClientResponse<JSONData>);
      } else if (
        urlString.includes(
          '/valintalaskentakoostepalvelu/resources/valintakoe/hakutoive/',
        )
      ) {
        //valintakoeosallistumiset
        return Promise.resolve({
          headers: {},
          data: VALINTAKOEOSALLISTUMISET,
        } as HttpClientResponse<JSONData>);
      } else if (
        urlString.includes('/lomake-editori/api/external/valinta-ui')
      ) {
        if (
          urlString.includes('hakemusOids=1.2.246.562.11.00000000000001543832')
        ) {
          return Promise.resolve({
            headers: {},
            data: HAKEMUKSET.filter(
              (h) => h.oid === '1.2.246.562.11.00000000000001543832',
            ),
          } as HttpClientResponse<JSONData>);
        }
        return Promise.resolve({
          headers: {},
          data: HAKEMUKSET.filter(
            (h) => h.oid !== '1.2.246.562.11.00000000000001543832',
          ),
        } as HttpClientResponse<JSONData>);
      }
      return Promise.reject();
    });
    const result = await getValintakoekutsutData({
      hakuOid: '1.2.246.562.29.00000000000000045102',
      hakukohdeOid: '1.2.246.562.20.00000000000000045105',
    });
    expect(result).toEqual({
      valintakokeetByTunniste: indexBy(
        VALINTAKOKEET.filter((v) => v.aktiivinen),
        prop('selvitettyTunniste'),
      ),
      hakemuksetByOid: {
        '1.2.246.562.11.00000000000001796027': {
          hakemusOid: '1.2.246.562.11.00000000000001796027',
          hakijaOid: '1.2.246.562.24.69259807406',
          etunimet: 'Ruhtinas',
          sukunimi: 'Nukettaja',
          hakijanNimi: 'Nukettaja Ruhtinas',
          asiointikieliKoodi: 'fi',
        },
        '1.2.246.562.11.00000000000001793706': {
          hakemusOid: '1.2.246.562.11.00000000000001793706',
          hakijaOid: '1.2.246.562.24.25732574711',
          etunimet: 'Kreivi',
          sukunimi: 'Dacula',
          hakijanNimi: 'Dacula Kreivi',
          asiointikieliKoodi: 'sv',
        },
        '1.2.246.562.11.00000000000001790371': {
          hakemusOid: '1.2.246.562.11.00000000000001790371',
          hakijaOid: '1.2.246.562.24.14598775927',
          etunimet: 'Puru',
          sukunimi: 'Purukumi',
          hakijanNimi: 'Purukumi Puru',
          asiointikieliKoodi: 'fi',
        },
        '1.2.246.562.11.00000000000001543832': {
          hakemusOid: '1.2.246.562.11.00000000000001543832',
          hakijaOid: '1.2.246.562.24.30476885816',
          etunimet: 'Haamu',
          sukunimi: 'Hui',
          hakijanNimi: 'Hui Haamu',
          asiointikieliKoodi: 'en',
        },
      },
      valintakoeOsallistumiset: VALINTAKOEOSALLISTUMISET,
    });
  });
});
