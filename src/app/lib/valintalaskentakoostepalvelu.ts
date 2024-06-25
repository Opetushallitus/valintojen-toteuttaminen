import { Haku, Hakukohde, getFullnameOfHakukohde } from './kouta-types';
import { configuration } from './configuration';
import { translateName } from './localization/translation-utils';
import { ValinnanvaiheTyyppi } from './valintaperusteet';
import { client } from './http-client';

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
}: {
  laskentaUrl: URL;
  haku: Haku;
  hakukohde: Hakukohde;
  vvTyyppi?: ValinnanvaiheTyyppi;
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean;
  valinnanvaihe?: number;
}): URL => {
  laskentaUrl.searchParams.append(
    'erillishaku',
    '' + sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  );
  //TODO need to translate or is default ok?
  laskentaUrl.searchParams.append('haunnimi', translateName(haku.nimi));
  laskentaUrl.searchParams.append('nimi', getFullnameOfHakukohde(hakukohde));
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
  });
  const response = await client.post(laskentaUrl.toString(), [hakukohde.oid], {
    headers: { 'Content-Type': 'application/json' },
  });
  return {
    startedNewCalculation: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export const kaynnistaLaskentaHakukohteenValinnanvaiheille = async (
  haku: Haku,
  hakukohde: Hakukohde,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean,
): Promise<CalculationStart> => {
  const laskentaUrl = formSearchParamsForStartCalculation({
    laskentaUrl: new URL(
      `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/haku/${haku.oid}/tyyppi/HAKUKOHDE/whitelist/true?`,
    ),
    haku,
    hakukohde,
    sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  });
  const response = await client.post(laskentaUrl.toString(), [hakukohde.oid], {
    headers: { 'Content-Type': 'application/json' },
  });
  return {
    startedNewCalculation: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export const getLaskennanTila = async (loadingUrl: string) => {
  const response = await client.get(
    `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/status/${loadingUrl}`,
  );
  return response.data;
};
