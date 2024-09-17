import { forEachObj, mapKeys, toLowerCase } from 'remeda';
import { ValintakoekutsutData } from './valintalaskentakoostepalvelu';
import {
  GetValintakoekutsutParams,
  ValintakoeKutsuItem,
} from './types/valintakoekutsut-types';

export const createValintakoekutsutKokeittain = (
  {
    hakukohdeOid,
    vainKutsuttavat,
  }: Omit<GetValintakoekutsutParams, 'hakuOid' | 'ryhmittely'>,
  {
    valintakoeOsallistumiset,
    hakemuksetByOid,
    valintakokeetByTunniste,
  }: ValintakoekutsutData,
) => {
  const kutsutKokeittain = valintakoeOsallistumiset?.reduce(
    (result, osallistumistulos) => {
      osallistumistulos.hakutoiveet.forEach((hakutoive) => {
        if (hakutoive.hakukohdeOid === hakukohdeOid) {
          hakutoive.valinnanVaiheet.forEach((valinnanVaihe) => {
            valinnanVaihe.valintakokeet.forEach((valintakoeTulos) => {
              const { valintakoeTunniste, nimi } = valintakoeTulos;
              const valintakoe = valintakokeetByTunniste[valintakoeTunniste];
              if (!valintakokeetByTunniste[valintakoeTunniste]) {
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
                  henkiloOid: hakemus?.hakijaOid,
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
    {} as Record<
      string,
      {
        nimi: string;
        kutsut: Array<ValintakoeKutsuItem>;
      }
    >,
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
};
