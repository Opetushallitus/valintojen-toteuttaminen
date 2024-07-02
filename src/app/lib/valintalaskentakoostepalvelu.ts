import { Haku, Hakukohde, getFullnameOfHakukohde } from './kouta-types';
import { configuration } from './configuration';
import { ValinnanvaiheTyyppi } from './valintaperusteet';
import { client } from './http-client';
import { TranslatedName } from './localization/localization-types';

export type CalculationStart = {
  startedNewCalculation: boolean;
  loadingUrl: string;
};

const formSearchParamsForStartCalculation = ({
  laskentaUrl,
  haku,
  hakukohde,
  vvTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  valinnanvaihe,
  translateEntity,
}: {
  laskentaUrl: URL;
  haku: Haku;
  hakukohde: Hakukohde;
  vvTyyppi?: ValinnanvaiheTyyppi;
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
  if (vvTyyppi) {
    laskentaUrl.searchParams.append(
      'valintakoelaskenta',
      `${vvTyyppi === ValinnanvaiheTyyppi.VALINTAKOE}`,
    );
  }
  return laskentaUrl;
};

export const kaynnistaLaskenta = async (
  haku: Haku,
  hakukohde: Hakukohde,
  vvTyyppi: ValinnanvaiheTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean,
  valinnanvaihe: number,
  translateEntity: (translateable: TranslatedName) => string,
): Promise<CalculationStart> => {
  const laskentaUrl = formSearchParamsForStartCalculation({
    laskentaUrl: new URL(
      `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/haku/${haku.oid}/tyyppi/HAKUKOHDE/whitelist/true?`,
    ),
    haku,
    hakukohde,
    vvTyyppi,
    sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
    valinnanvaihe,
    translateEntity,
  });
  const response = await client.post(laskentaUrl.toString(), [hakukohde.oid]);
  return {
    startedNewCalculation: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export const kaynnistaLaskentaHakukohteenValinnanvaiheille = async (
  haku: Haku,
  hakukohde: Hakukohde,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean,
  translateEntity: (translateable: TranslatedName) => string,
): Promise<CalculationStart> => {
  const laskentaUrl = formSearchParamsForStartCalculation({
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
    startedNewCalculation: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export type CalculationErrorSummary = {
  hakukohdeOid: string;
  notifications: string[] | undefined;
};

export const getLaskennanTilaHakukohteelle = async (
  loadingUrl: string,
): Promise<CalculationErrorSummary> => {
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
