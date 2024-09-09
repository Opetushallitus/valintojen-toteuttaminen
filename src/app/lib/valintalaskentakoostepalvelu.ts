import { Haku, Hakukohde, getFullnameOfHakukohde } from './types/kouta-types';
import { configuration } from './configuration';
import { ValinnanvaiheTyyppi } from './types/valintaperusteet-types';
import { client } from './http-client';
import { TranslatedName } from './localization/localization-types';
import { HenkilonValintaTulos } from './types/sijoittelu-types';
import {
  HakemuksenPistetiedot,
  HakukohteenPistetiedot,
  LaskentaErrorSummary,
  LaskentaStart,
  ValintakoeOsallistuminen,
  ValintakokeenPisteet,
} from './types/laskenta-types';
import { getHakemukset } from './ataru';
import { getValintakokeet } from './valintaperusteet';
import { flatMap, indexBy, mapValues, pipe } from 'remeda';

const formSearchParamsForStartLaskenta = ({
  laskentaUrl,
  haku,
  hakukohde,
  valinnanvaiheTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  valinnanvaihe,
  translateEntity,
}: {
  laskentaUrl: URL;
  haku: Haku;
  hakukohde: Hakukohde;
  valinnanvaiheTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean;
  valinnanvaihe?: number;
  translateEntity: (translateable: TranslatedName) => string;
}): URL => {
  laskentaUrl.searchParams.append(
    'erillishaku',
    '' + sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  );
  laskentaUrl.searchParams.append('haunnimi', translateEntity(haku.nimi));
  laskentaUrl.searchParams.append(
    'nimi',
    getFullnameOfHakukohde(hakukohde, translateEntity),
  );
  if (valinnanvaihe && valinnanvaiheTyyppi !== ValinnanvaiheTyyppi.VALINTAKOE) {
    laskentaUrl.searchParams.append('valinnanvaihe', '' + valinnanvaihe);
  }
  if (valinnanvaiheTyyppi) {
    laskentaUrl.searchParams.append(
      'valintakoelaskenta',
      `${valinnanvaiheTyyppi === ValinnanvaiheTyyppi.VALINTAKOE}`,
    );
  }
  return laskentaUrl;
};

export const kaynnistaLaskenta = async (
  haku: Haku,
  hakukohde: Hakukohde,
  valinnanvaiheTyyppi: ValinnanvaiheTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean,
  valinnanvaihe: number,
  translateEntity: (translateable: TranslatedName) => string,
): Promise<LaskentaStart> => {
  const laskentaUrl = formSearchParamsForStartLaskenta({
    laskentaUrl: new URL(
      `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/haku/${haku.oid}/tyyppi/HAKUKOHDE/whitelist/true?`,
    ),
    haku,
    hakukohde,
    valinnanvaiheTyyppi: valinnanvaiheTyyppi,
    sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
    valinnanvaihe,
    translateEntity,
  });
  const response = await client.post(laskentaUrl.toString(), [hakukohde.oid]);
  return {
    startedNewLaskenta: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export const kaynnistaLaskentaHakukohteenValinnanvaiheille = async (
  haku: Haku,
  hakukohde: Hakukohde,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean,
  translateEntity: (translateable: TranslatedName) => string,
): Promise<LaskentaStart> => {
  const laskentaUrl = formSearchParamsForStartLaskenta({
    laskentaUrl: new URL(
      `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/haku/${haku.oid}/tyyppi/HAKUKOHDE/whitelist/true?`,
    ),
    haku,
    hakukohde,
    sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
    translateEntity,
  });
  const response = await client.post(laskentaUrl.toString(), [hakukohde.oid]);
  return {
    startedNewLaskenta: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export const getLaskennanTilaHakukohteelle = async (
  loadingUrl: string,
): Promise<LaskentaErrorSummary> => {
  const response = await client.get(
    `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/status/${loadingUrl}/yhteenveto`,
  );
  return response.data?.hakukohteet
    ?.filter((hk: { ilmoitukset: [{ tyyppi: string }] }) =>
      hk.ilmoitukset.some((i) => i.tyyppi === 'VIRHE'),
    )
    .map(
      (hakukohde: {
        hakukohdeOid: string;
        ilmoitukset: [{ otsikko: string }] | null;
      }) => {
        return {
          hakukohdeOid: hakukohde.hakukohdeOid,
          notifications: hakukohde.ilmoitukset?.map((i) => i.otsikko),
        };
      },
    )[0];
};

export const getHakukohteenValintatuloksetIlmanHakijanTilaa = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<HenkilonValintaTulos[]> => {
  const { data } = await client.get(
    `${configuration.valintalaskentaKoostePalveluUrl}proxy/valintatulosservice/ilmanhakijantilaa/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  );
  return data.map((t: { tila: string; hakijaOid: string }) => {
    return { tila: t.tila, hakijaOid: t.hakijaOid };
  });
};

export const getScoresForHakukohde = async (
  hakuOid: string,
  hakukohdeOid: string,
): Promise<HakukohteenPistetiedot> => {
  const hakemukset = await getHakemukset(hakuOid, hakukohdeOid);
  const hakemuksetIndexed = indexBy(hakemukset, (h) => h.hakemusOid);
  const kokeet = await getValintakokeet(hakukohdeOid);
  const { data } = await client.get(
    `${configuration.valintalaskentaKoostePalveluUrl}pistesyotto/koostetutPistetiedot/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  );
  console.log(data);

  const hakemuksetKokeilla: HakemuksenPistetiedot[] = data.valintapisteet.map(
    (p: {
      applicationAdditionalDataDTO: {
        oid: string;
        personOid: string;
        additionalData: Record<string, string>;
      };
    }) => {
      const hakemus = hakemuksetIndexed[p.applicationAdditionalDataDTO.oid];
      const kokeenPisteet: ValintakokeenPisteet[] = kokeet.map((k) => {
        const arvo = p.applicationAdditionalDataDTO.additionalData[k.tunniste];
        const osallistuminen = p.applicationAdditionalDataDTO.additionalData[
          k.osallistuminenTunniste
        ] as ValintakoeOsallistuminen;
        return {
          tunniste: k.tunniste,
          arvo,
          osallistuminen,
          osallistuminenTunniste: k.osallistuminenTunniste,
        };
      });
      return {
        hakemusOid: hakemus.hakemusOid,
        hakijaOid: hakemus.hakijaOid,
        hakijanNimi: hakemus.hakijanNimi,
        etunimet: hakemus.etunimet,
        sukunimi: hakemus.sukunimi,
        valintakokeenPisteet: kokeenPisteet,
      };
    },
  );

  const lastModified = data.lastModified && new Date(data.lastModified);
  return {
    lastModified,
    valintakokeet: kokeet,
    hakemukset: hakemuksetKokeilla,
  };
};

export const updateScoresForHakukohde = async (
  hakuOid: string,
  hakukohdeOid: string,
  pistetiedot: HakemuksenPistetiedot[],
) => {
  const mappedPistetiedot = pistetiedot.map((p) => {
    const additionalData = pipe(
      p.valintakokeenPisteet,
      flatMap((vp) => [
        { key: vp.tunniste, value: vp.arvo },
        { key: vp.osallistuminenTunniste, value: vp.osallistuminen },
      ]),
      indexBy((kv) => kv.key),
      mapValues((val) => val.value),
    );
    return {
      oid: p.hakemusOid,
      personOid: p.hakijaOid,
      firstNames: p.etunimet,
      lastName: p.sukunimi,
      additionalData,
    };
  });
  await client.put(
    `${configuration.valintalaskentaKoostePalveluUrl}pistesyotto/koostetutPistetiedot/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
    mappedPistetiedot,
  );
};
