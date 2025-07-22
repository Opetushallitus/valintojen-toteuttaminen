'use client';
import { useSuspenseQueries } from '@tanstack/react-query';
import { TranslatedName } from '../lib/localization/localization-types';
import {
  ValintalaskennanValintatapaJonosijaModel,
  ValintalaskennanTulosValinnanvaiheModel,
  ValintalaskennanValintatapajonoModel,
  TuloksenTila,
} from '../lib/types/laskenta-types';
import {
  concat,
  flatMap,
  groupBy,
  indexBy,
  isNumber,
  map,
  mapKeys,
  pipe,
  prop,
  sortBy,
} from 'remeda';
import { HakemuksenTila, Hakemus } from '@/lib/ataru/ataru-types';
import { Valinnanvaihe } from '@/lib/valintaperusteet/valintaperusteet-types';
import { selectLaskennattomatValinnanvaiheet } from '@/lib/valintaperusteet/valintaperusteet-utils';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { pointToComma } from '@/lib/common';
import { queryOptionsGetHakukohteenValintalaskennanTulokset } from '@/lib/valintalaskenta/valintalaskenta-queries';
import { queryOptionsGetHakukohteenValinnanvaiheet } from '@/lib/valintaperusteet/valintaperusteet-queries';
import { queryOptionsGetHakemukset } from '@/lib/ataru/ataru-queries';
import { useMemo } from 'react';

export type LaskennanJonosijaTulos<
  A extends Record<string, unknown> = Record<string, unknown>,
> = Omit<Partial<ValintalaskennanValintatapaJonosijaModel>, 'jonosija'> & {
  hakemusOid: string;
  hakijaOid: string;
  hakutoiveNumero?: number;
  tuloksenTila?: TuloksenTila;
  kuvaus?: TranslatedName;
  pisteet: string;
  jonosija: string;
} & A;

type AdditionalHakemusFields = {
  hakijanNimi: Hakemus['hakijanNimi'];
  hakemuksenTila: Hakemus['tila'];
  henkilotunnus: Hakemus['henkilotunnus'];
};

export type LaskennanJonosijaTulosWithHakijaInfo =
  LaskennanJonosijaTulos<AdditionalHakemusFields>;

export type LaskennanValintatapajonoTulos<
  A extends Record<string, unknown> = Record<string, unknown>,
> = Omit<ValintalaskennanValintatapajonoModel, 'jonosijat'> & {
  jonosijat: Array<LaskennanJonosijaTulos<A>>;
};

export type LaskennanValintatapajonoTulosWithHakijaInfo =
  LaskennanValintatapajonoTulos<AdditionalHakemusFields>;

export type LaskennanValinnanvaiheInfo = Omit<
  ValintalaskennanTulosValinnanvaiheModel,
  'valintatapajonot' | 'hakuOid'
>;

export type LaskennanValinnanvaiheTulos<
  A extends Record<string, unknown> = Record<string, unknown>,
> = LaskennanValinnanvaiheInfo & {
  valintatapajonot?: Array<LaskennanValintatapajonoTulos<A>>;
};

export type LaskennanValinnanvaiheet<
  A extends Record<string, unknown> = Record<string, unknown>,
> = Array<LaskennanValinnanvaiheTulos<A>>;

export type LaskennanValinnanvaiheetWithHakijaInfo = Array<
  LaskennanValinnanvaiheTulos<AdditionalHakemusFields>
>;

const selectJonosijaFields = (
  jonosijaData?: ValintalaskennanValintatapaJonosijaModel,
) => {
  const jarjestyskriteeri = jonosijaData?.jarjestyskriteerit?.[0];

  const arvo = jarjestyskriteeri?.arvo;
  let jonosija = jonosijaData?.jonosija;

  /* Järjestyskriteerin pisteiden (arvo-kenttä) negatiivisia arvoja käytetään jonosijojen manuaaliseen tallentamiseen.
   * Näin saadaan haluttu järjestys ilman oikeita pistetietoja.
   * Palautetaan arvosta muodostettu jonosija, jotta se voidaan esittää käyttäjälle oikein.
   */
  if (isNumber(arvo) && arvo < 0) {
    jonosija = -arvo;
  }

  return {
    jonosija: jonosija?.toString() ?? '',
    harkinnanvarainen: jonosijaData?.harkinnanvarainen,
    prioriteetti: jonosijaData?.prioriteetti,
    jarjestyskriteerit: jonosijaData?.jarjestyskriteerit.map((kriteeri) => ({
      ...kriteeri,
      arvo: pointToComma(kriteeri.arvo?.toString()) ?? '',
    })),
    hakutoiveNumero: jonosijaData?.prioriteetti,
    pisteet: pointToComma(jarjestyskriteeri?.arvo?.toString()) ?? '',
    tuloksenTila: jonosijaData?.tuloksenTila as TuloksenTila | undefined,
    muokattu: Boolean(jonosijaData?.muokattu),
    kuvaus: mapKeys(jarjestyskriteeri?.kuvaus ?? {}, (key) =>
      key.toLowerCase(),
    ),
  };
};

/**
 * Valitsee muokattavissa olevat valintalaskennan tulokset. Valinnanvaiheille, jotka ei käytä valintalaskentaa luodaan tyhjät tulokset
 * niille hakemuksille, joille ei löydy tuloksia valintalaskennasta.
 *
 * @template HakemusIn - Tyyppi, joka määrittää hakemuksen sisääntulon kentät. Päätellään hakemukset-parametrista.
 * @template HakemusOut - Tyyppi, joka määrittää hakemuksen ulostulon kentät. Päätellään selectHakemusFields-parametrin paluuarvosta.
 *
 * @param {Array<ValintalaskennanTulosValinnanvaiheModel>} params.valintalaskennanTulokset - Lista valintalaskennan tuloksista.
 * @param {Array<Valinnanvaihe>} params.valinnanvaiheet - Lista valinnanvaiheista (valintaperusteet-servicestä).
 * @param {Array<HakemusIn>} params.hakemukset - Lista hakemuksista, joille tulokset halutaan listata.
 * @param {(hakemusOid: string) => HakemusOut} [params.selectHakemusFields] - Funktio, jonka antamalla voi täydentää jonosijoja hakemuksen tiedoilla.
 *
 * @returns {Array} Muokattavissa olevat valintalaskennan tulokset valinnanvaiheittain.
 */
export const selectEditableValintalaskennanTulokset = <
  HakemusOut extends Record<string, unknown> = Record<string, unknown>,
  HakemusIn extends { hakemusOid: string; hakijaOid: string } = {
    hakemusOid: string;
    hakijaOid: string;
  },
>({
  valintalaskennanTulokset,
  valinnanvaiheet,
  hakemukset,
  selectHakemusFields,
}: {
  valintalaskennanTulokset: Array<ValintalaskennanTulosValinnanvaiheModel>;
  valinnanvaiheet: Array<Valinnanvaihe>;
  hakemukset: Array<HakemusIn>;
  selectHakemusFields?: (hakemusOid: string) => HakemusOut;
}) => {
  const laskennattomatVaiheet =
    selectLaskennattomatValinnanvaiheet(valinnanvaiheet);

  const lasketutJonotByOid = pipe(
    valintalaskennanTulokset,
    flatMap((vaihe) => vaihe.valintatapajonot ?? []),
    groupBy(prop('oid')),
  );

  const laskennattomatVaiheetTuloksilla = map(
    laskennattomatVaiheet,
    (vaihe) => {
      return {
        jarjestysnumero: 0,
        valinnanvaiheoid: vaihe.oid,
        nimi: vaihe.nimi,
        createdAt: null,
        valintatapajonot: vaihe.jonot.map((jono) => {
          const laskettuJono = lasketutJonotByOid?.[jono.oid]?.[0];
          return {
            oid: jono.oid,
            nimi: jono.nimi,
            valintatapajonooid: jono.oid,
            prioriteetti: jono.prioriteetti,
            valmisSijoiteltavaksi: Boolean(
              jono.automaattinenSijoitteluunSiirto ??
                laskettuJono?.valmisSijoiteltavaksi,
            ),
            siirretaanSijoitteluun: Boolean(
              laskettuJono?.siirretaanSijoitteluun,
            ),
            kaytetaanKokonaispisteita: Boolean(
              laskettuJono?.kaytetaanKokonaispisteita,
            ),
            jonosijat: pipe(
              // Valintalaskenta ei ole käytössä valinnanvaiheelle, joten käydään läpi kaikki hakemukset
              // täydentäen tuloksen puuttuessa "tyhjä" laskennan tulos, jotta voidaan näyttää
              // kaikki hakemukset ja mahdollistaa tulosten syöttäminen käsin.
              hakemukset,
              map((hakemus) => {
                const jonosija = laskettuJono?.jonosijat?.find(
                  (jonosijaCandidate) =>
                    jonosijaCandidate.hakemusOid === hakemus.hakemusOid,
                );
                return {
                  ...selectJonosijaFields(jonosija),
                  hakemusOid: hakemus.hakemusOid,
                  hakijaOid: hakemus.hakijaOid,
                  ...(selectHakemusFields?.(hakemus.hakemusOid) ??
                    ({} as HakemusOut)),
                };
              }),
            ),
          };
        }),
      };
    },
  );

  const laskennattomatVaiheetOids = map(laskennattomatVaiheet, prop('oid'));

  return pipe(
    valintalaskennanTulokset.filter(
      (vaihe) => !laskennattomatVaiheetOids.includes(vaihe.valinnanvaiheoid),
    ) ?? [],
    map((valinnanVaihe) => {
      return {
        ...valinnanVaihe,
        valintatapajonot: valinnanVaihe?.valintatapajonot?.map(
          (valintatapajono) => {
            return {
              ...valintatapajono,
              jonosijat: pipe(
                valintatapajono.jonosijat,
                map((jonosija) => {
                  return {
                    ...selectJonosijaFields(jonosija),
                    hakemusOid: jonosija.hakemusOid,
                    hakijaOid: jonosija.hakijaOid,
                    ...(selectHakemusFields?.(jonosija.hakemusOid) ??
                      ({} as HakemusOut)),
                  };
                }),
              ),
            };
          },
        ),
      };
    }),
    sortBy([prop('jarjestysnumero'), 'desc']),
    (lasketutVaiheet) =>
      concat(laskennattomatVaiheetTuloksilla, lasketutVaiheet),
  );
};

export const useEditableValintalaskennanTulokset = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams): LaskennanValinnanvaiheet<AdditionalHakemusFields> => {
  const [
    { data: hakemukset },
    { data: hakukohteenLaskennanTulokset },
    { data: valinnanvaiheet },
  ] = useSuspenseQueries({
    queries: [
      queryOptionsGetHakemukset({
        hakuOid,
        hakukohdeOid,
      }),
      queryOptionsGetHakukohteenValintalaskennanTulokset(hakukohdeOid),
      queryOptionsGetHakukohteenValinnanvaiheet(hakukohdeOid),
    ],
  });

  return useMemo(() => {
    const notFoundHakemukset: Array<string> = [];
    const hakemuksetByOid = indexBy(hakemukset ?? [], prop('hakemusOid'));
    const result =
      selectEditableValintalaskennanTulokset<AdditionalHakemusFields>({
        valintalaskennanTulokset: hakukohteenLaskennanTulokset,
        valinnanvaiheet,
        hakemukset,
        selectHakemusFields(hakemusOid) {
          const hakemus = hakemuksetByOid[hakemusOid];

          if (!hakemus) {
            notFoundHakemukset.push(hakemusOid);
          }

          return {
            hakijanNimi: hakemus?.hakijanNimi ?? '',
            hakemuksenTila: hakemus?.tila ?? HakemuksenTila.KESKEN,
            henkilotunnus: hakemus?.henkilotunnus ?? '',
          };
        },
      });

    if (notFoundHakemukset.length > 0) {
      console.warn(
        'Seuraavien hakemusten tietoja ei löytynyt Atarusta, vaikka valintalaskennan tuloksia löytyi:',
        notFoundHakemukset,
      );
    }

    return result;
  }, [hakukohteenLaskennanTulokset, valinnanvaiheet, hakemukset]);
};
