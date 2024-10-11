import {
  forEachObj,
  indexBy,
  isEmpty,
  mapKeys,
  prop,
  toLowerCase,
} from 'remeda';
import {
  GetValintakoekutsutParams,
  ValintakoeKutsuItem,
  ValintakoekutsutData,
} from './types/valintakoekutsut-types';
import { Valintakoe } from './types/valintaperusteet-types';
import { HakutoiveValintakoe } from './types/valintalaskentakoostepalvelu-types';

export type ValintakoekutsutKokeittain = Record<
  string,
  {
    nimi: string;
    kutsut: Array<ValintakoeKutsuItem>;
  }
>;

type HakijanValintakoekutsu = {
  nimi: string;
  valintakoeTunniste: string;
  osallistuminen: ValintakoeKutsuItem['osallistuminen'];
};

export type ValintakoekutsuHakijoittain = Pick<
  ValintakoeKutsuItem,
  'hakemusOid' | 'hakijaOid' | 'hakijanNimi'
> & {
  kutsut: Record<string, HakijanValintakoekutsu>;
};

export type ValintakoekutsutHakijoittain = {
  kokeet: Array<Valintakoe>;
  kutsut: Array<ValintakoekutsuHakijoittain>;
};

const filterVisibleValintakokeet = (valintakokeet: Array<Valintakoe>) => {
  return valintakokeet.filter(
    (valintakoe) => valintakoe.aktiivinen && valintakoe.lahetetaankoKoekutsut,
  );
};

const deduceOsallistuminen = ({
  valintakoe,
  valintakoeTulos,
}: {
  valintakoe: Valintakoe;
  valintakoeTulos: HakutoiveValintakoe;
}) => {
  return valintakoe.kutsutaankoKaikki
    ? 'OSALLISTUU'
    : valintakoeTulos.osallistuminenTulos.osallistuminen;
};

export function createValintakoekutsutKokeittain(
  {
    hakukohdeOid,
    vainKutsuttavat = false,
  }: Omit<GetValintakoekutsutParams, 'hakuOid' | 'ryhmittely'>,
  {
    valintakokeet,
    valintakoeOsallistumiset,
    hakemuksetByOid,
  }: ValintakoekutsutData,
): ValintakoekutsutKokeittain {
  const valintakokeetByTunniste = indexBy(
    filterVisibleValintakokeet(valintakokeet),
    prop('selvitettyTunniste'),
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

              const osallistuminen = deduceOsallistuminen({
                valintakoe,
                valintakoeTulos,
              });
              if (
                (vainKutsuttavat && osallistuminen === 'OSALLISTUU') ||
                !vainKutsuttavat
              ) {
                result[valintakoeTunniste].kutsut.push({
                  hakemusOid: hakemus.hakemusOid,
                  hakijaOid: hakemus?.hakijaOid,
                  hakijanNimi: hakemus?.hakijanNimi,
                  asiointiKieli: hakemus?.asiointikieliKoodi,
                  osallistuminen: `osallistuminen.${osallistuminen}`,
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

export function createValintakoekutsutHakijoittain(
  {
    hakukohdeOid,
    vainKutsuttavat = false,
  }: Omit<GetValintakoekutsutParams, 'hakuOid' | 'ryhmittely'>,
  {
    valintakokeet,
    valintakoeOsallistumiset,
    hakemuksetByOid,
  }: ValintakoekutsutData,
): ValintakoekutsutHakijoittain {
  const kokeet = filterVisibleValintakokeet(valintakokeet);
  const valintakokeetByTunniste = indexBy(kokeet, prop('selvitettyTunniste'));

  const kutsut: Array<ValintakoekutsuHakijoittain> = [];

  valintakoeOsallistumiset.forEach((osallistumistulos) => {
    const hakemus = hakemuksetByOid[osallistumistulos.hakemusOid];
    const kutsutByTunniste: Record<string, HakijanValintakoekutsu> = {};

    osallistumistulos.hakutoiveet.forEach((hakutoive) => {
      if (hakutoive.hakukohdeOid === hakukohdeOid) {
        hakutoive.valinnanVaiheet.forEach((valinnanVaihe) => {
          valinnanVaihe.valintakokeet.forEach((valintakoeTulos) => {
            const { valintakoeTunniste, nimi } = valintakoeTulos;
            const valintakoe = valintakokeetByTunniste[valintakoeTunniste];
            if (!valintakoe) {
              return;
            }
            const osallistuminen = deduceOsallistuminen({
              valintakoe,
              valintakoeTulos,
            });
            if (
              !vainKutsuttavat ||
              (vainKutsuttavat && osallistuminen === 'OSALLISTUU')
            ) {
              kutsutByTunniste[valintakoeTunniste] = {
                nimi,
                valintakoeTunniste,
                osallistuminen: `osallistuminen.${osallistuminen}`,
              };
            }
          });
        });
      }
    });
    if (!isEmpty(kutsutByTunniste)) {
      kutsut.push({
        hakemusOid: hakemus.hakemusOid,
        hakijaOid: hakemus?.hakijaOid,
        hakijanNimi: hakemus?.hakijanNimi,
        kutsut: kutsutByTunniste,
      });
    }
  });

  return {
    kokeet,
    kutsut,
  };
}
