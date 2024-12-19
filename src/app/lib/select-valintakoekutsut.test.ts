import { describe, expect, test } from 'vitest';
import VALINTAKOKEET from '@tests/e2e/fixtures/valintakokeet.json';
import VALINTAKOEOSALLISTUMISET from '@tests/e2e/fixtures/valintakoeosallistumiset.json';
import {
  selectValintakoekutsutHakijoittain,
  selectValintakoekutsutKokeittain,
} from './select-valintakoekutsut';
import { HakutoiveValintakoeOsallistumiset } from './types/valintalaskentakoostepalvelu-types';

const HAKEMUKSET_BY_OID = {
  '1.2.246.562.11.00000000000001796027': {
    hakemusOid: '1.2.246.562.11.00000000000001796027',
    hakijaOid: '1.2.246.562.24.69259807406',
    hakijanNimi: 'Nukettaja Ruhtinas',
    asiointikieliKoodi: 'fi',
  },
  '1.2.246.562.11.00000000000001793706': {
    hakemusOid: '1.2.246.562.11.00000000000001793706',
    hakijaOid: '1.2.246.562.24.25732574711',
    hakijanNimi: 'Dacula Kreivi',
    asiointikieliKoodi: 'sv',
  },
  '1.2.246.562.11.00000000000001790371': {
    hakemusOid: '1.2.246.562.11.00000000000001790371',
    hakijaOid: '1.2.246.562.24.14598775927',
    hakijanNimi: 'Purukumi Puru',
    asiointikieliKoodi: 'fi',
  },
  '1.2.246.562.11.00000000000001543832': {
    hakemusOid: '1.2.246.562.11.00000000000001543832',
    hakijaOid: '1.2.246.562.24.30476885816',
    hakijanNimi: 'Hui Haamu',
    asiointikieliKoodi: 'en',
  },
} as const;

describe('selectValintakoekutsutKokeittain', () => {
  test('Return also kutsut with other osallistuminen when vainKutsuttavat=false', async () => {
    const result = selectValintakoekutsutKokeittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: false,
      },
      {
        valintakokeet: VALINTAKOKEET,
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset:
          VALINTAKOEOSALLISTUMISET as Array<HakutoiveValintakoeOsallistumiset>,
      },
    );
    expect(result).toEqual({
      '1_2_246_562_20_00000000000000045105_paasykoe': {
        nimi: 'Pääsykoe',
        kutsut: [
          {
            hakemusOid: '1.2.246.562.11.00000000000001796027',
            hakijaOid: '1.2.246.562.24.69259807406',
            hakijanNimi: 'Nukettaja Ruhtinas',
            asiointiKieli: 'fi',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:50:59.998+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001793706',
            hakijaOid: '1.2.246.562.24.25732574711',
            hakijanNimi: 'Dacula Kreivi',
            asiointiKieli: 'sv',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.190+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001790371',
            hakijaOid: '1.2.246.562.24.14598775927',
            hakijanNimi: 'Purukumi Puru',
            asiointiKieli: 'fi',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.115+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001543832',
            hakijaOid: '1.2.246.562.24.30476885816',
            hakijanNimi: 'Hui Haamu',
            asiointiKieli: 'en',
            osallistuminen: 'osallistuminen.EI_OSALLISTU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.060+00:00',
          },
        ],
      },
    });
  });

  test('Return only kutsut with osallistuminen=OSALLISTUU when vainKutsuttavat=true', async () => {
    const result = selectValintakoekutsutKokeittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: true,
      },
      {
        valintakokeet: VALINTAKOKEET,
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset:
          VALINTAKOEOSALLISTUMISET as Array<HakutoiveValintakoeOsallistumiset>,
      },
    );
    expect(result).toEqual({
      '1_2_246_562_20_00000000000000045105_paasykoe': {
        nimi: 'Pääsykoe',
        kutsut: [
          {
            hakemusOid: '1.2.246.562.11.00000000000001796027',
            hakijaOid: '1.2.246.562.24.69259807406',
            hakijanNimi: 'Nukettaja Ruhtinas',
            asiointiKieli: 'fi',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:50:59.998+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001793706',
            hakijaOid: '1.2.246.562.24.25732574711',
            hakijanNimi: 'Dacula Kreivi',
            asiointiKieli: 'sv',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.190+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001790371',
            hakijaOid: '1.2.246.562.24.14598775927',
            hakijanNimi: 'Purukumi Puru',
            asiointiKieli: 'fi',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.115+00:00',
          },
        ],
      },
    });
  });

  test('Return valintakoe with empty kutsut, when valintakokeet data only', async () => {
    const result = selectValintakoekutsutKokeittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: true,
      },
      {
        valintakokeet: VALINTAKOKEET,
        hakemuksetByOid: {},
        valintakoeOsallistumiset: [],
      },
    );
    expect(result).toEqual({
      '1_2_246_562_20_00000000000000045105_paasykoe': {
        nimi: 'Pääsykoe',
        kutsut: [],
      },
    });
  });

  test('Return all kutsut with overwritten osallistuminen=OSALLISTUU when kutsutaankokaikki=true', async () => {
    const result = selectValintakoekutsutKokeittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: true,
      },
      {
        valintakokeet: VALINTAKOKEET.map((v) => ({
          ...v,
          kutsutaankoKaikki: true,
        })),
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset:
          VALINTAKOEOSALLISTUMISET as Array<HakutoiveValintakoeOsallistumiset>,
      },
    );
    expect(result).toEqual({
      '1_2_246_562_20_00000000000000045105_paasykoe': {
        nimi: 'Pääsykoe',
        kutsut: [
          {
            hakemusOid: '1.2.246.562.11.00000000000001796027',
            hakijaOid: '1.2.246.562.24.69259807406',
            hakijanNimi: 'Nukettaja Ruhtinas',
            asiointiKieli: 'fi',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:50:59.998+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001793706',
            hakijaOid: '1.2.246.562.24.25732574711',
            hakijanNimi: 'Dacula Kreivi',
            asiointiKieli: 'sv',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.190+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001790371',
            hakijaOid: '1.2.246.562.24.14598775927',
            hakijanNimi: 'Purukumi Puru',
            asiointiKieli: 'fi',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.115+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001543832',
            hakijaOid: '1.2.246.562.24.30476885816',
            hakijanNimi: 'Hui Haamu',
            asiointiKieli: 'en',
            osallistuminen: 'osallistuminen.OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.060+00:00',
          },
        ],
      },
    });
  });
});

const AKTIIVISET_VALINTAKOKEET = VALINTAKOKEET.filter((v) => v.aktiivinen);

describe('selectValintakoekutsutHakijoittain', () => {
  test('Return also kutsut with other osallistuminen when vainKutsuttavat=false', async () => {
    const result = selectValintakoekutsutHakijoittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: false,
      },
      {
        valintakokeet: VALINTAKOKEET,
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset:
          VALINTAKOEOSALLISTUMISET as Array<HakutoiveValintakoeOsallistumiset>,
      },
    );
    expect(result).toEqual({
      kokeet: AKTIIVISET_VALINTAKOKEET,
      hakijat: [
        {
          hakemusOid: '1.2.246.562.11.00000000000001796027',
          hakijaOid: '1.2.246.562.24.69259807406',
          hakijanNimi: 'Nukettaja Ruhtinas',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
        {
          hakemusOid: '1.2.246.562.11.00000000000001793706',
          hakijaOid: '1.2.246.562.24.25732574711',
          hakijanNimi: 'Dacula Kreivi',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
        {
          hakemusOid: '1.2.246.562.11.00000000000001790371',
          hakijaOid: '1.2.246.562.24.14598775927',
          hakijanNimi: 'Purukumi Puru',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
        {
          hakemusOid: '1.2.246.562.11.00000000000001543832',
          hakijaOid: '1.2.246.562.24.30476885816',
          hakijanNimi: 'Hui Haamu',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.EI_OSALLISTU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
      ],
    });
  });

  test('Return only kutsut with osallistuminen=OSALLISTUU when vainKutsuttavat=true', async () => {
    const result = selectValintakoekutsutHakijoittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: true,
      },
      {
        valintakokeet: VALINTAKOKEET,
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset:
          VALINTAKOEOSALLISTUMISET as Array<HakutoiveValintakoeOsallistumiset>,
      },
    );
    expect(result).toEqual({
      kokeet: AKTIIVISET_VALINTAKOKEET,
      hakijat: [
        {
          hakemusOid: '1.2.246.562.11.00000000000001796027',
          hakijaOid: '1.2.246.562.24.69259807406',
          hakijanNimi: 'Nukettaja Ruhtinas',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
        {
          hakemusOid: '1.2.246.562.11.00000000000001793706',
          hakijaOid: '1.2.246.562.24.25732574711',
          hakijanNimi: 'Dacula Kreivi',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
        {
          hakemusOid: '1.2.246.562.11.00000000000001790371',
          hakijaOid: '1.2.246.562.24.14598775927',
          hakijanNimi: 'Purukumi Puru',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
      ],
    });
  });

  test('Return valintakoe with empty kutsut, when valintakokeet data only', async () => {
    const result = selectValintakoekutsutHakijoittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: true,
      },
      {
        valintakokeet: VALINTAKOKEET,
        hakemuksetByOid: {},
        valintakoeOsallistumiset: [],
      },
    );
    expect(result).toEqual({
      kokeet: AKTIIVISET_VALINTAKOKEET,
      hakijat: [],
    });
  });

  test('Return all kutsut with overwritten osallistuminen=OSALLISTUU when kutsutaankokaikki=true', async () => {
    const kaikkiKutsutaanValintakokeet = VALINTAKOKEET.map((v) => ({
      ...v,
      kutsutaankoKaikki: true,
    }));
    const result = selectValintakoekutsutHakijoittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: true,
      },
      {
        valintakokeet: kaikkiKutsutaanValintakokeet,
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset:
          VALINTAKOEOSALLISTUMISET as Array<HakutoiveValintakoeOsallistumiset>,
      },
    );
    expect(result).toEqual({
      kokeet: kaikkiKutsutaanValintakokeet.filter((v) => v.aktiivinen),
      hakijat: [
        {
          hakemusOid: '1.2.246.562.11.00000000000001796027',
          hakijaOid: '1.2.246.562.24.69259807406',
          hakijanNimi: 'Nukettaja Ruhtinas',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
        {
          hakemusOid: '1.2.246.562.11.00000000000001793706',
          hakijaOid: '1.2.246.562.24.25732574711',
          hakijanNimi: 'Dacula Kreivi',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
        {
          hakemusOid: '1.2.246.562.11.00000000000001790371',
          hakijaOid: '1.2.246.562.24.14598775927',
          hakijanNimi: 'Purukumi Puru',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
        {
          hakemusOid: '1.2.246.562.11.00000000000001543832',
          hakijaOid: '1.2.246.562.24.30476885816',
          hakijanNimi: 'Hui Haamu',
          kutsut: {
            '1_2_246_562_20_00000000000000045105_paasykoe': {
              nimi: 'Pääsykoe',
              osallistuminen: 'osallistuminen.OSALLISTUU',
              valintakoeTunniste:
                '1_2_246_562_20_00000000000000045105_paasykoe',
            },
          },
        },
      ],
    });
  });
});
