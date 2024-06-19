import { Haku, Hakukohde, getFullnameOfHakukohde } from './kouta-types';
import { configuration } from './configuration';
import { translateName } from './localization/translation-utils';
import { ValinnanvaiheTyyppi } from './valintaperusteet';
import { client } from './http-client';

export type CalculationStart = {
  startedNewCalculation: boolean;
  loadingUrl: string;
};

export const kaynnistaLaskenta = async (
  valinnanvaihe: number,
  haku: Haku,
  hakukohde: Hakukohde,
  vvTyyppi: ValinnanvaiheTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean,
): Promise<CalculationStart> => {
  const laskentaUrl = new URL(
    `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/haku/${haku.oid}/tyyppi/HAKUKOHDE/whitelist/true?`,
  );
  laskentaUrl.searchParams.append(
    'erillishaku',
    '' + sijoitellaankoHaunHakukohteetLaskennanYhteydessa,
  );
  //TODO need to translate or is default ok?
  laskentaUrl.searchParams.append('haunnimi', translateName(haku.nimi));
  laskentaUrl.searchParams.append('nimi', getFullnameOfHakukohde(hakukohde));
  laskentaUrl.searchParams.append('valinnanvaihe', '' + valinnanvaihe);
  laskentaUrl.searchParams.append(
    'valintakoelaskenta',
    `${vvTyyppi === ValinnanvaiheTyyppi.VALINTAKOE}`,
  );
  const response = await client.post(laskentaUrl.toString(), [hakukohde.oid], {
    headers: { 'Content-Type': 'application/json' },
  });
  console.log(response);
  return {
    startedNewCalculation: response.data?.lisatiedot?.luotiinkoUusiLaskenta,
    loadingUrl: response.data?.latausUrl,
  };
};

export const getLaskennanTila = async (loadingUrl: string) => {
  const response = await client.get(
    `${configuration.valintalaskentaKoostePalveluUrl}valintalaskentakerralla/status/${loadingUrl}`,
  );
  console.log(response.data);
  return response.data;
};
