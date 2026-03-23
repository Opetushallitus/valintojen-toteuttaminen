import { indexBy, isEmpty, mapKeys, prop, toLowerCase } from 'remeda';
import {
  GetValintakoekutsutParams,
  ValintakoeKutsuItem,
  ValintakoekutsutData,
  ValintakoeOsallistuminen,
} from './types/valintakoekutsut-types';
import { Valintakoe } from './valintaperusteet/valintaperusteet-types';
import {
  HakutoiveValintakoe,
  HakutoiveValintakoeOsallistumiset,
} from './valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-types';

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
  hakijat: Array<ValintakoekutsuHakijoittain>;
};

const filterVisibleValintakokeet = (valintakokeet: Array<Valintakoe>) =>
  valintakokeet.filter(
    (valintakoe) => valintakoe.aktiivinen && valintakoe.lahetetaankoKoekutsut,
  );

const forEachValintakoekutsu = (
  {
    vainKutsuttavat,
    hakukohdeOid,
    valintakokeet,
    hakutoiveOsallistuminen,
  }: {
    vainKutsuttavat: boolean;
    hakukohdeOid: string;
    valintakokeet: Array<Valintakoe>;
    hakutoiveOsallistuminen?: HakutoiveValintakoeOsallistumiset;
  },
  fn: (params: {
    valintakoe: Valintakoe;
    hakutoiveValintakoe?: HakutoiveValintakoe;
    valintakoeOsallistuminen: ValintakoeOsallistuminen;
    laskettuPvm?: string;
  }) => void,
) => {
  if (!hakutoiveOsallistuminen) {
    valintakokeet.forEach((valintakoe) => {
      if (valintakoe.kutsutaankoKaikki) {
        fn({
          valintakoe,
          valintakoeOsallistuminen: 'OSALLISTUU',
        });
      }
    });
    return;
  }

  const valintakokeetByTunniste = indexBy(
    valintakokeet,
    prop('selvitettyTunniste'),
  );
  hakutoiveOsallistuminen.hakutoiveet.forEach((hakutoive) => {
    if (hakutoive.hakukohdeOid === hakukohdeOid) {
      hakutoive.valinnanVaiheet.forEach((valinnanVaihe) => {
        valinnanVaihe.valintakokeet.forEach((hakutoiveValintakoe) => {
          const { valintakoeTunniste } = hakutoiveValintakoe;
          const valintakoe = valintakokeetByTunniste[valintakoeTunniste];

          if (!valintakoe) {
            return;
          }
          const valintakoeOsallistuminen = valintakoe.kutsutaankoKaikki
            ? 'OSALLISTUU'
            : hakutoiveValintakoe.osallistuminenTulos.osallistuminen;

          if (
            !vainKutsuttavat ||
            (vainKutsuttavat && valintakoeOsallistuminen === 'OSALLISTUU')
          ) {
            fn({
              valintakoe,
              laskettuPvm: hakutoiveOsallistuminen.createdAt,
              valintakoeOsallistuminen,
              hakutoiveValintakoe,
            });
          }
        });
      });
    }
  });
};

export function selectValintakoekutsutKokeittain(
  {
    hakukohdeOid,
    vainKutsuttavat = false,
  }: Omit<GetValintakoekutsutParams, 'hakuOid' | 'ryhmittely'>,
  { valintakokeet, valintakoeOsallistumiset, hakemukset }: ValintakoekutsutData,
): ValintakoekutsutKokeittain {
  const kutsutKokeittain: ValintakoekutsutKokeittain = {};
  const valintakoeOsallistumisetByHakemusOid = indexBy(
    valintakoeOsallistumiset,
    prop('hakemusOid'),
  );

  const visibleValintakokeet = filterVisibleValintakokeet(valintakokeet);
  visibleValintakokeet.forEach((valintakoe) => {
    kutsutKokeittain[valintakoe.selvitettyTunniste] = {
      nimi: valintakoe.nimi,
      kutsut: [],
    };
  });

  hakemukset.forEach((hakemus) => {
    forEachValintakoekutsu(
      {
        hakutoiveOsallistuminen:
          valintakoeOsallistumisetByHakemusOid[hakemus.hakemusOid],
        hakukohdeOid,
        vainKutsuttavat,
        valintakokeet: visibleValintakokeet,
      },
      ({
        valintakoeOsallistuminen,
        valintakoe,
        hakutoiveValintakoe,
        laskettuPvm,
      }) => {
        kutsutKokeittain[valintakoe.selvitettyTunniste]!.kutsut.push({
          hakemusOid: hakemus.hakemusOid,
          hakijaOid: hakemus.hakijaOid,
          hakijanNimi: hakemus.hakijanNimi,
          asiointiKieli: hakemus.asiointikieliKoodi,
          osallistuminen: `osallistuminen.${valintakoeOsallistuminen}`,
          lisatietoja: mapKeys(
            hakutoiveValintakoe?.osallistuminenTulos?.kuvaus ?? {},
            (k) => toLowerCase(k),
          ),
          laskettuPvm,
        });
      },
    );
  });

  return kutsutKokeittain;
}

export function selectValintakoekutsutHakijoittain(
  {
    hakukohdeOid,
    vainKutsuttavat = false,
  }: Omit<GetValintakoekutsutParams, 'hakuOid' | 'ryhmittely'>,
  { valintakokeet, valintakoeOsallistumiset, hakemukset }: ValintakoekutsutData,
): ValintakoekutsutHakijoittain {
  const kokeet = filterVisibleValintakokeet(valintakokeet);
  const valintakoeOsallistumisetByHakemusOid = indexBy(
    valintakoeOsallistumiset,
    prop('hakemusOid'),
  );

  const hakijat: Array<ValintakoekutsuHakijoittain> = [];

  hakemukset.forEach((hakemus) => {
    const kutsutByTunniste: Record<string, HakijanValintakoekutsu> = {};

    forEachValintakoekutsu(
      {
        hakutoiveOsallistuminen:
          valintakoeOsallistumisetByHakemusOid[hakemus.hakemusOid],
        hakukohdeOid,
        vainKutsuttavat,
        valintakokeet: kokeet,
      },
      ({ valintakoeOsallistuminen, valintakoe }) => {
        kutsutByTunniste[valintakoe.selvitettyTunniste] = {
          nimi: valintakoe.nimi,
          valintakoeTunniste: valintakoe.selvitettyTunniste,
          osallistuminen: `osallistuminen.${valintakoeOsallistuminen}`,
        };
      },
    );

    if (!isEmpty(kutsutByTunniste)) {
      hakijat.push({
        hakemusOid: hakemus.hakemusOid,
        hakijaOid: hakemus?.hakijaOid,
        hakijanNimi: hakemus?.hakijanNimi,
        kutsut: kutsutByTunniste,
      });
    }
  });

  return {
    kokeet,
    hakijat,
  };
}
