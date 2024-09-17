import { describe, expect, test } from 'vitest';
import { indexBy, prop } from 'remeda';
import VALINTAKOKEET from '@tests/e2e/fixtures/valintakokeet.json';
import VALINTAKOEOSALLISTUMISET from '@tests/e2e/fixtures/valintakoeosallistumiset.json';
import { ValintakoeOsallistumistulos } from './valintalaskentakoostepalvelu';
import { createValintakoekutsutKokeittain } from './createValintakoekutsut';

const HAKEMUKSET_BY_OID = {
  '1.2.246.562.11.00000000000001796027': {
    oid: '1.2.246.562.11.00000000000001796027',
    henkiloOid: '1.2.246.562.24.69259807406',
    etunimet: 'Ruhtinas',
    sukunimi: 'Nukettaja',
    hakijanNimi: 'Nukettaja Ruhtinas',
    asiointikieliKoodi: 'fi',
  },
  '1.2.246.562.11.00000000000001793706': {
    oid: '1.2.246.562.11.00000000000001793706',
    henkiloOid: '1.2.246.562.24.25732574711',
    etunimet: 'Kreivi',
    sukunimi: 'Dacula',
    hakijanNimi: 'Dacula Kreivi',
    asiointikieliKoodi: 'sv',
  },
  '1.2.246.562.11.00000000000001790371': {
    oid: '1.2.246.562.11.00000000000001790371',
    henkiloOid: '1.2.246.562.24.14598775927',
    etunimet: 'Puru',
    sukunimi: 'Purukumi',
    hakijanNimi: 'Purukumi Puru',
    asiointikieliKoodi: 'fi',
  },
  '1.2.246.562.11.00000000000001543832': {
    oid: '1.2.246.562.11.00000000000001543832',
    henkiloOid: '1.2.246.562.24.30476885816',
    etunimet: 'Haamu',
    sukunimi: 'Hui',
    hakijanNimi: 'Hui Haamu',
    asiointikieliKoodi: 'en',
  },
} as const;

describe('createValintakoekutsutKokeittain', () => {
  test('Return also kutsut with other osallistuminen when vainKutsuttavat=false', async () => {
    const result = createValintakoekutsutKokeittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: false,
      },
      {
        valintakokeetByTunniste: indexBy(
          VALINTAKOKEET,
          prop('selvitettyTunniste'),
        ),
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset:
          VALINTAKOEOSALLISTUMISET as Array<ValintakoeOsallistumistulos>,
      },
    );
    expect(result).toEqual({
      '1_2_246_562_20_00000000000000045105_paasykoe': {
        nimi: 'Pääsykoe',
        kutsut: [
          {
            hakemusOid: '1.2.246.562.11.00000000000001796027',
            henkiloOid: '1.2.246.562.24.69259807406',
            hakijanNimi: 'Nukettaja Ruhtinas',
            asiointiKieli: 'fi',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:50:59.998+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001793706',
            henkiloOid: '1.2.246.562.24.25732574711',
            hakijanNimi: 'Dacula Kreivi',
            asiointiKieli: 'sv',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.190+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001790371',
            henkiloOid: '1.2.246.562.24.14598775927',
            hakijanNimi: 'Purukumi Puru',
            asiointiKieli: 'fi',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.115+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001543832',
            henkiloOid: '1.2.246.562.24.30476885816',
            hakijanNimi: 'Hui Haamu',
            asiointiKieli: 'en',
            osallistuminen: 'EI_OSALLISTU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.060+00:00',
          },
        ],
      },
    });
  });

  test('Return only kutsut with osallistuminen=OSALLISTUU when vainKutsuttavat=true', async () => {
    const result = createValintakoekutsutKokeittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: true,
      },
      {
        valintakokeetByTunniste: indexBy(
          VALINTAKOKEET,
          prop('selvitettyTunniste'),
        ),
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset:
          VALINTAKOEOSALLISTUMISET as Array<ValintakoeOsallistumistulos>,
      },
    );
    expect(result).toEqual({
      '1_2_246_562_20_00000000000000045105_paasykoe': {
        nimi: 'Pääsykoe',
        kutsut: [
          {
            hakemusOid: '1.2.246.562.11.00000000000001796027',
            henkiloOid: '1.2.246.562.24.69259807406',
            hakijanNimi: 'Nukettaja Ruhtinas',
            asiointiKieli: 'fi',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:50:59.998+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001793706',
            henkiloOid: '1.2.246.562.24.25732574711',
            hakijanNimi: 'Dacula Kreivi',
            asiointiKieli: 'sv',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.190+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001790371',
            henkiloOid: '1.2.246.562.24.14598775927',
            hakijanNimi: 'Purukumi Puru',
            asiointiKieli: 'fi',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.115+00:00',
          },
        ],
      },
    });
  });

  test('Return valintakoe with empty kutsut, when valintakokeet data only', async () => {
    const result = createValintakoekutsutKokeittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: true,
      },
      {
        valintakokeetByTunniste: indexBy(
          VALINTAKOKEET,
          prop('selvitettyTunniste'),
        ),
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
    const result = createValintakoekutsutKokeittain(
      {
        hakukohdeOid: '1.2.246.562.20.00000000000000045105',
        vainKutsuttavat: true,
      },
      {
        valintakokeetByTunniste: indexBy(
          VALINTAKOKEET.map((v) => ({
            ...v,
            kutsutaankoKaikki: true,
          })),
          prop('selvitettyTunniste'),
        ),
        hakemuksetByOid: HAKEMUKSET_BY_OID,
        valintakoeOsallistumiset:
          VALINTAKOEOSALLISTUMISET as Array<ValintakoeOsallistumistulos>,
      },
    );
    expect(result).toEqual({
      '1_2_246_562_20_00000000000000045105_paasykoe': {
        nimi: 'Pääsykoe',
        kutsut: [
          {
            hakemusOid: '1.2.246.562.11.00000000000001796027',
            henkiloOid: '1.2.246.562.24.69259807406',
            hakijanNimi: 'Nukettaja Ruhtinas',
            asiointiKieli: 'fi',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:50:59.998+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001793706',
            henkiloOid: '1.2.246.562.24.25732574711',
            hakijanNimi: 'Dacula Kreivi',
            asiointiKieli: 'sv',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.190+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001790371',
            henkiloOid: '1.2.246.562.24.14598775927',
            hakijanNimi: 'Purukumi Puru',
            asiointiKieli: 'fi',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.115+00:00',
          },
          {
            hakemusOid: '1.2.246.562.11.00000000000001543832',
            henkiloOid: '1.2.246.562.24.30476885816',
            hakijanNimi: 'Hui Haamu',
            asiointiKieli: 'en',
            osallistuminen: 'OSALLISTUU',
            lisatietoja: {},
            laskettuPvm: '2024-01-09T07:51:00.060+00:00',
          },
        ],
      },
    });
  });
});
