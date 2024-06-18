import { Haku, Hakukohde, getFullnameOfHakukohde } from './kouta-types';
import { configuration } from './configuration';
import { translateName } from './localization/translation-utils';
import { ValinnanvaiheTyyppi } from './valintaperusteet';
import { client } from './http-client';

export type CalculationStart = {
  startedNewCalculation: boolean;
  loadUrl: string;
};

export const kaynnistaLaskenta = async (
  valinnanvaihe: number,
  haku: Haku,
  hakukohde: Hakukohde,
  vvTyyppi: ValinnanvaiheTyyppi,
  sijoitellaankoHaunHakukohteetLaskennanYhteydessa: boolean,
): Promise<boolean> => {
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
  return response.data?.lisatiedot?.luotiinkoUusiLaskenta;
};
