import { Haku, Hakukohde, getFullnameOfHakukohde } from './types/kouta-types';
import { configuration } from './configuration';
import { ValinnanvaiheTyyppi } from './types/valintaperusteet-types';
import { client } from './http-client';
import { TranslatedName } from './localization/localization-types';
import { HenkilonValintaTulos } from './types/sijoittelu-types';
import { LaskentaErrorSummary, LaskentaStart } from './types/laskenta-types';

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
  if (valinnanvaihe) {
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
  return response.data?.hakukohteet?.map(
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
