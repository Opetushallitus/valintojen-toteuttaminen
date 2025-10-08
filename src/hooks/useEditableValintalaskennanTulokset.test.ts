import { describe, it, expect } from 'vitest';
import { selectEditableValintalaskennanTulokset } from './useEditableValintalaskennanTulokset';
import {
  ValintalaskennanTulosValinnanvaiheModel,
  ValintalaskennanValintatapajonoModel,
  ValintalaskennanValintatapaJonosijaModel,
  TuloksenTila,
  JarjestyskriteeriModel,
} from '../lib/types/laskenta-types';
import {
  Valinnanvaihe,
  ValinnanvaiheTyyppi,
} from '../lib/valintaperusteet/valintaperusteet-types';
import { HakemuksenTila } from '@/lib/ataru/ataru-types';

describe('selectEditableValintalaskennanTulokset', () => {
  const mockHakemus1 = {
    hakemusOid: 'hakemus-1',
    hakijaOid: 'hakija-1',
  };

  const mockHakemus2 = {
    hakemusOid: 'hakemus-2',
    hakijaOid: 'hakija-2',
  };

  const mockHakemukset = [mockHakemus1, mockHakemus2];

  const mockJarjestyskriteeriTulos: JarjestyskriteeriModel = {
    arvo: 85.5,
    tila: 'HYVAKSYTTAVISSA',
    prioriteetti: 1,
    nimi: 'Kokonaispistemäärä',
    kuvaus: { FI: 'Pisteet', SV: 'Poäng', EN: 'Points' },
  };

  const mockJonosijaTulos: ValintalaskennanValintatapaJonosijaModel = {
    jonosija: 1,
    hakemusOid: 'hakemus-1',
    hakijaOid: 'hakija-1',
    tuloksenTila: TuloksenTila.HYVAKSYTTAVISSA,
    harkinnanvarainen: false,
    prioriteetti: 1,
    muokattu: false,
    jarjestyskriteerit: [mockJarjestyskriteeriTulos],
  };

  const mockValintatapajonoTulos: ValintalaskennanValintatapajonoModel = {
    oid: 'jono-1',
    nimi: 'Ensisijainen jono',
    valintatapajonooid: 'jono-1',
    prioriteetti: 1,
    jonosijat: [mockJonosijaTulos],
    valmisSijoiteltavaksi: true,
    siirretaanSijoitteluun: true,
    kaytetaanKokonaispisteita: false,
  };

  const mockValinnanvaiheTulos: ValintalaskennanTulosValinnanvaiheModel = {
    jarjestysnumero: 1,
    valinnanvaiheoid: 'vaihe-1',
    hakuOid: 'haku-1',
    nimi: 'Ensimmäinen valinnanvaihe',
    createdAt: 1234567890,
    valintatapajonot: [mockValintatapajonoTulos],
  };

  const mockValintaperusteValinnanvaihe: Valinnanvaihe = {
    nimi: 'Toinen valinnanvaihe',
    aktiivinen: true,
    valisijoittelu: false,
    tyyppi: ValinnanvaiheTyyppi.TAVALLINEN,
    oid: 'vaihe-2',
    jonot: [
      {
        nimi: 'Manuaalinen jono',
        oid: 'jono-2',
        prioriteetti: 1,
        kaytetaanValintalaskentaa: false,
        automaattinenSijoitteluunSiirto: true,
        siirretaanSijoitteluun: true,
      },
    ],
  };

  it('should process existing valintalaskenta results correctly', () => {
    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [mockValinnanvaiheTulos],
      valinnanvaiheet: [],
      hakemukset: mockHakemukset,
    });

    expect(result).toHaveLength(1);

    const vaihe = result[0];
    expect(vaihe).toBeDefined();
    expect(vaihe).toMatchObject({
      jarjestysnumero: 1,
      valinnanvaiheoid: 'vaihe-1',
      nimi: 'Ensimmäinen valinnanvaihe',
    });

    const valintatapajonot = vaihe?.valintatapajonot;
    expect(valintatapajonot).toHaveLength(1);

    const jono = valintatapajonot?.[0];
    expect(jono).toBeDefined();
    expect(jono).toMatchObject({
      hasTulos: true,
      oid: 'jono-1',
      nimi: 'Ensisijainen jono',
    });

    const jonosijat = jono?.jonosijat;
    expect(jonosijat).toHaveLength(1);

    const jonosija = jonosijat?.[0];
    expect(jonosija).toBeDefined();
    expect(jonosija).toMatchObject({
      hakemusOid: 'hakemus-1',
      hakijaOid: 'hakija-1',
      jonosija: '1',
      harkinnanvarainen: false,
      prioriteetti: 1,
      pisteet: '85,5',
      tuloksenTila: TuloksenTila.HYVAKSYTTAVISSA,
      muokattu: false,
    });

    expect(jonosija?.jarjestyskriteerit).toHaveLength(1);
    const kriteeri = jonosija?.jarjestyskriteerit?.[0];
    expect(kriteeri).toMatchObject({
      arvo: '85,5',
      kuvaus: { FI: 'Pisteet', SV: 'Poäng', EN: 'Points' },
      tila: 'HYVAKSYTTAVISSA',
    });
  });

  it('should handle negative jarjestyskriteeri values (jonosija)', () => {
    const negativeJarjestyskriteeri: JarjestyskriteeriModel = {
      ...mockJarjestyskriteeriTulos,
      arvo: -5, // Negative value should become jonosija
    };

    const jonosijaWithNegativeArvo: ValintalaskennanValintatapaJonosijaModel = {
      ...mockJonosijaTulos,
      jonosija: 10, // This should be overridden by negative arvo
      jarjestyskriteerit: [negativeJarjestyskriteeri],
    };

    const valinnanvaiheWithNegativeArvo: ValintalaskennanTulosValinnanvaiheModel =
      {
        ...mockValinnanvaiheTulos,
        valintatapajonot: [
          {
            ...mockValintatapajonoTulos,
            jonosijat: [jonosijaWithNegativeArvo],
          },
        ],
      };

    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [valinnanvaiheWithNegativeArvo],
      valinnanvaiheet: [],
      hakemukset: mockHakemukset,
    });

    const jonosijat = result[0]?.valintatapajonot?.[0]?.jonosijat;
    const jonosija = jonosijat?.[0];
    expect(jonosija?.jonosija).toBe('5');
    expect(jonosija?.pisteet).toBe('-5'); // Original negative value in pisteet
  });

  it('should merge tulokset with valinnanvaiheet and sort correctly', () => {
    const higherJarjestysnumeroVaihe: ValintalaskennanTulosValinnanvaiheModel =
      {
        ...mockValinnanvaiheTulos,
        jarjestysnumero: 2,
        valinnanvaiheoid: 'vaihe-3',
        nimi: 'Kolmas valinnanvaihe',
      };

    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [
        mockValinnanvaiheTulos,
        higherJarjestysnumeroVaihe,
      ],
      valinnanvaiheet: [mockValintaperusteValinnanvaihe],
      hakemukset: mockHakemukset,
    });

    expect(result).toHaveLength(3);

    // Should have laskennaton vaihe first, then sorted by jarjestysnumero desc
    expect(result[0]?.valinnanvaiheoid).toBe('vaihe-2'); // Laskennaton (jarjestysnumero: 0)
    expect(result[1]?.valinnanvaiheoid).toBe('vaihe-3'); // jarjestysnumero: 2
    expect(result[2]?.valinnanvaiheoid).toBe('vaihe-1'); // jarjestysnumero: 1
  });

  it('should use selectHakemusFields to enrich jonosijat', () => {
    const selectHakemusFields = (hakemusOid: string) => {
      if (hakemusOid === 'hakemus-1') {
        return {
          hakijanNimi: 'Matti Meikäläinen',
          hakemuksenTila: HakemuksenTila.AKTIIVINEN,
          henkilotunnus: '010101-123A',
        };
      }
      return {
        hakijanNimi: 'Maija Mehiläinen',
        hakemuksenTila: HakemuksenTila.KESKEN,
        henkilotunnus: '020202-234B',
      };
    };

    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [mockValinnanvaiheTulos],
      valinnanvaiheet: [],
      hakemukset: mockHakemukset,
      selectHakemusFields,
    });

    const jonosijat = result[0]?.valintatapajonot?.[0]?.jonosijat;
    const jonosija = jonosijat?.[0];
    expect(jonosija).toMatchObject({
      hakemusOid: 'hakemus-1',
      hakijanNimi: 'Matti Meikäläinen',
      hakemuksenTila: HakemuksenTila.AKTIIVINEN,
      henkilotunnus: '010101-123A',
    });
  });

  it('should handle empty inputs gracefully', () => {
    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [],
      valinnanvaiheet: [],
      hakemukset: [],
    });

    expect(result).toEqual([]);
  });

  it('should handle zero jarjestyskriteeri arvo', () => {
    const zeroJarjestyskriteeri: JarjestyskriteeriModel = {
      ...mockJarjestyskriteeriTulos,
      arvo: 0,
    };

    const jonosijaWithZeroArvo: ValintalaskennanValintatapaJonosijaModel = {
      ...mockJonosijaTulos,
      jarjestyskriteerit: [zeroJarjestyskriteeri],
    };

    const valinnanvaiheWithZeroArvo: ValintalaskennanTulosValinnanvaiheModel = {
      ...mockValinnanvaiheTulos,
      valintatapajonot: [
        {
          ...mockValintatapajonoTulos,
          jonosijat: [jonosijaWithZeroArvo],
        },
      ],
    };

    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [valinnanvaiheWithZeroArvo],
      valinnanvaiheet: [],
      hakemukset: mockHakemukset,
    });

    const jonosijat = result[0]?.valintatapajonot?.[0]?.jonosijat;
    const jonosija = jonosijat?.[0];
    expect(jonosija).toMatchObject({
      jonosija: '1', // Should use original jonosija when arvo is not negative number
      pisteet: '0', // Should show zero
    });
  });

  it('should filter out inactive valinnanvaihe', () => {
    const inactiveValinnanvaihe: Valinnanvaihe = {
      ...mockValintaperusteValinnanvaihe,
      aktiivinen: false,
    };

    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [],
      valinnanvaiheet: [inactiveValinnanvaihe],
      hakemukset: mockHakemukset,
    });

    expect(result).toEqual([]); // Inactive valinnanvaihe should be filtered out
  });

  it('should handle automaattinenSijoitteluunSiirto=true for jono without laskenta and with tulos', () => {
    const existingJonoResult: ValintalaskennanValintatapajonoModel = {
      oid: 'jono-2',
      nimi: 'Existing result for manual jono',
      valintatapajonooid: 'jono-2',
      prioriteetti: 1,
      jonosijat: [mockJonosijaTulos],
      valmisSijoiteltavaksi: false,
      siirretaanSijoitteluun: true,
      kaytetaanKokonaispisteita: true,
    };

    const valinnanvaiheWithExistingResult: ValintalaskennanTulosValinnanvaiheModel =
      {
        ...mockValinnanvaiheTulos,
        valinnanvaiheoid: 'vaihe-2',
        valintatapajonot: [existingJonoResult],
      };

    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [valinnanvaiheWithExistingResult],
      valinnanvaiheet: [mockValintaperusteValinnanvaihe],
      hakemukset: mockHakemukset,
    });

    expect(result).toHaveLength(1);

    // Find the laskennaton vaihe result
    const laskennaton = result.find((r) => r?.valinnanvaiheoid === 'vaihe-2');
    const jonot = laskennaton?.valintatapajonot;

    expect(jonot?.[0]).toMatchObject({
      hasTulos: true,
      oid: 'jono-2',
      valmisSijoiteltavaksi: false, // Value from existing result
      siirretaanSijoitteluun: true, // Value from valintaperusteet (base definition)
      kaytetaanKokonaispisteita: true,
    });
  });

  it('should handle automaattinenSijoitteluunSiirto=true for jono without laskenta and without tulos', () => {
    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [],
      valinnanvaiheet: [mockValintaperusteValinnanvaihe],
      hakemukset: mockHakemukset,
    });

    expect(result).toHaveLength(1);

    // Find the laskennaton vaihe result
    const laskennaton = result.find((r) => r?.valinnanvaiheoid === 'vaihe-2');
    const jonot = laskennaton?.valintatapajonot;

    expect(jonot?.[0]).toMatchObject({
      hasTulos: false,
      oid: 'jono-2',
      valmisSijoiteltavaksi: true, // automaattinenSijoitteluunSiirto=true
      siirretaanSijoitteluun: true, // value from valintaperusteet (base definition)
      kaytetaanKokonaispisteita: false,
    });
  });

  it('should handle automaattinenSijoitteluunSiirto=false for jono without laskenta and without tulos', () => {
    const result = selectEditableValintalaskennanTulokset({
      valintalaskennanTulokset: [],
      valinnanvaiheet: [
        {
          ...mockValintaperusteValinnanvaihe,
          jonot: mockValintaperusteValinnanvaihe.jonot.map((jono) => ({
            ...jono,
            siirretaanSijoitteluun: true,
            automaattinenSijoitteluunSiirto: false,
          })),
        },
      ],
      hakemukset: mockHakemukset,
    });

    expect(result).toHaveLength(1);

    // Find the laskennaton vaihe result
    const laskennaton = result.find((r) => r?.valinnanvaiheoid === 'vaihe-2');
    const jonot = laskennaton?.valintatapajonot;

    expect(jonot?.[0]).toMatchObject({
      hasTulos: false,
      oid: 'jono-2',
      valmisSijoiteltavaksi: false, // automaattinenSijoitteluunSiirto=false
      siirretaanSijoitteluun: true, // value from valintaperusteet (base definition)
      kaytetaanKokonaispisteita: false,
    });
  });
});
