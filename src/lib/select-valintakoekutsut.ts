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
    hakutoiveOsallistuminen: HakutoiveValintakoeOsallistumiset;
  },
  fn: (params: {
    valintakoe: Valintakoe;
    hakutoiveValintakoe: HakutoiveValintakoe;
    valintakoeOsallistuminen: ValintakoeOsallistuminen;
  }) => void,
) => {
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
  {
    valintakokeet,
    valintakoeOsallistumiset,
    hakemuksetByOid,
  }: ValintakoekutsutData,
): ValintakoekutsutKokeittain {
  const kutsutKokeittain: ValintakoekutsutKokeittain = {};

  const visibleValintakokeet = filterVisibleValintakokeet(valintakokeet);
  visibleValintakokeet.forEach((valintakoe) => {
    kutsutKokeittain[valintakoe.selvitettyTunniste] = {
      nimi: valintakoe.nimi,
      kutsut: [],
    };
  });

  valintakoeOsallistumiset.forEach((hakutoiveOsallistuminen) => {
    forEachValintakoekutsu(
      {
        hakutoiveOsallistuminen,
        hakukohdeOid,
        vainKutsuttavat,
        valintakokeet: visibleValintakokeet,
      },
      ({ valintakoeOsallistuminen, valintakoe, hakutoiveValintakoe }) => {
        const hakemus = hakemuksetByOid[hakutoiveOsallistuminen.hakemusOid];
        if (!hakemus) {
          console.warn(
            `Hakemus-OIDille ${hakutoiveOsallistuminen.hakemusOid} löytyi valintakoekutsu, mutta ei hakemusta Atarusta!`,
          );
          return;
        }
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
          laskettuPvm: hakutoiveOsallistuminen.createdAt,
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
  {
    valintakokeet,
    valintakoeOsallistumiset,
    hakemuksetByOid,
  }: ValintakoekutsutData,
): ValintakoekutsutHakijoittain {
  const kokeet = filterVisibleValintakokeet(valintakokeet);

  const hakijat: Array<ValintakoekutsuHakijoittain> = [];

  valintakoeOsallistumiset.forEach((hakutoiveOsallistuminen) => {
    const hakemus = hakemuksetByOid[hakutoiveOsallistuminen.hakemusOid];
    const kutsutByTunniste: Record<string, HakijanValintakoekutsu> = {};

    forEachValintakoekutsu(
      {
        hakutoiveOsallistuminen,
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

    if (!hakemus) {
      console.warn(
        `Hakemus-OIDille ${hakutoiveOsallistuminen.hakemusOid} löytyi valintakoekutsu, mutta ei hakemusta Atarusta!`,
      );
      return;
    }

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
