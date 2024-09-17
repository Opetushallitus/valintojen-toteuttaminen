import { forEachObj, mapKeys, pickBy, toLowerCase } from 'remeda';
import {
  GetValintakoekutsutParams,
  ValintakoeKutsuItem,
  ValintakoekutsutData,
} from './types/valintakoekutsut-types';

export type ValintakoekutsutKokeittain = Record<
  string,
  {
    nimi: string;
    kutsut: Array<ValintakoeKutsuItem>;
  }
>;

export function createValintakoekutsutKokeittain(
  {
    hakukohdeOid,
    vainKutsuttavat = false,
  }: Omit<GetValintakoekutsutParams, 'hakuOid' | 'ryhmittely'>,
  {
    valintakoeOsallistumiset,
    hakemuksetByOid,
    valintakokeetByTunniste: allValintakokeetByTunniste,
  }: ValintakoekutsutData,
): ValintakoekutsutKokeittain {
  const valintakokeetByTunniste = pickBy(
    allValintakokeetByTunniste,
    (valintakoe) => valintakoe.aktiivinen && valintakoe.lahetetaankoKoekutsut,
  );

  const kutsutKokeittain = valintakoeOsallistumiset?.reduce(
    (result, osallistumistulos) => {
      osallistumistulos.hakutoiveet.forEach((hakutoive) => {
        if (hakutoive.hakukohdeOid === hakukohdeOid) {
          hakutoive.valinnanVaiheet.forEach((valinnanVaihe) => {
            valinnanVaihe.valintakokeet.forEach((valintakoeTulos) => {
              const { valintakoeTunniste, nimi } = valintakoeTulos;
              const valintakoe = valintakokeetByTunniste[valintakoeTunniste];
              if (!valintakoe) {
                return result;
              }
              if (!result[valintakoeTunniste]) {
                result[valintakoeTunniste] = {
                  nimi,
                  kutsut: [],
                };
              }
              const hakemus = hakemuksetByOid[osallistumistulos.hakemusOid];

              const osallistuminen = valintakoe.kutsutaankoKaikki
                ? 'OSALLISTUU'
                : valintakoeTulos.osallistuminenTulos.osallistuminen;
              if (
                (vainKutsuttavat && osallistuminen === 'OSALLISTUU') ||
                !vainKutsuttavat
              ) {
                result[valintakoeTunniste].kutsut.push({
                  hakemusOid: hakemus.hakemusOid,
                  hakijaOid: hakemus?.hakijaOid,
                  hakijanNimi: hakemus?.hakijanNimi,
                  asiointiKieli: hakemus?.asiointikieliKoodi,
                  osallistuminen,
                  lisatietoja: mapKeys(
                    valintakoeTulos?.osallistuminenTulos?.kuvaus ?? {},
                    (k) => toLowerCase(k),
                  ),
                  laskettuPvm: osallistumistulos.createdAt,
                });
              }
            });
          });
        }
      });
      return result;
    },
    {} as ValintakoekutsutKokeittain,
  );

  // Lisätään myös valintakokeet, joille ei ollut kutsuja
  forEachObj(valintakokeetByTunniste, (valintakoe) => {
    if (!kutsutKokeittain[valintakoe.selvitettyTunniste]) {
      kutsutKokeittain[valintakoe.selvitettyTunniste] = {
        nimi: valintakoe.nimi,
        kutsut: [],
      };
    }
  });

  return kutsutKokeittain;
}
