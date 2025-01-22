'use client';
import { queryOptions, useSuspenseQueries } from '@tanstack/react-query';
import { getHakukohteenLasketutValinnanvaiheet } from '../lib/valintalaskenta-service';
import { getHakemukset } from '../lib/ataru';
import { TranslatedName } from '../lib/localization/localization-types';
import {
  JonoSijaModel,
  LaskettuValinnanVaiheModel,
  LaskettuValintatapajonoModel,
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
import { HakemuksenTila } from '@/app/lib/types/ataru-types';
import { valinnanvaiheetIlmanLaskentaaQueryOptions } from '@/app/lib/valintaperusteet';
import { Valinnanvaihe } from '@/app/lib/types/valintaperusteet-types';

export const hakukohteenLasketutValinnanvaiheetQueryOptions = (
  hakukohdeOid: string,
) =>
  queryOptions({
    queryKey: ['getHakukohteenLasketutValinnanvaiheet', hakukohdeOid],
    queryFn: () => getHakukohteenLasketutValinnanvaiheet(hakukohdeOid),
  });

export type JonoSija<
  A extends Record<string, unknown> = Record<string, unknown>,
> = Omit<
  Partial<JonoSijaModel>,
  'harkinnanvarainen' | 'prioriteetti' | 'jonosija'
> & {
  hakemusOid: string;
  hakijaOid: string;
  pisteet?: string;
  hakutoiveNumero?: number;
  tuloksenTila?: TuloksenTila;
  muutoksenSyy?: TranslatedName;
  jonosija?: string;
} & A;

type AdditionalHakemusFields = {
  hakijanNimi: string;
  hakemuksenTila: HakemuksenTila;
};

export type JonoSijaWithHakijaInfo = JonoSija<AdditionalHakemusFields>;

export type LaskettuJono<
  A extends Record<string, unknown> = Record<string, unknown>,
> = Omit<LaskettuValintatapajonoModel, 'jonosijat'> & {
  jonosijat: Array<JonoSija<A>>;
};

export type LaskettuJonoWithHakijaInfo = LaskettuJono<AdditionalHakemusFields>;

export type LaskettuValinnanvaiheInfo = Omit<
  LaskettuValinnanVaiheModel,
  'valintatapajonot' | 'hakuOid'
>;

export type LaskettuValinnanvaihe<
  A extends Record<string, unknown> = Record<string, unknown>,
> = LaskettuValinnanvaiheInfo & {
  valintatapajonot?: Array<LaskettuJono<A>>;
};

export type LasketutValinnanvaiheet<
  A extends Record<string, unknown> = Record<string, unknown>,
> = Array<LaskettuValinnanvaihe<A>>;

export type LasketutValinnanvaiheetWithHakijaInfo = Array<
  LaskettuValinnanvaihe<AdditionalHakemusFields>
>;

const selectJonosijaFields = (jonosijaData?: JonoSijaModel) => {
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
    jonosija: jonosija?.toString(),
    harkinnanvarainen: jonosijaData?.harkinnanvarainen,
    prioriteetti: jonosijaData?.prioriteetti,
    jarjestyskriteerit: jonosijaData?.jarjestyskriteerit,
    hakutoiveNumero: jonosijaData?.prioriteetti,
    pisteet: jarjestyskriteeri?.arvo?.toString(),
    tuloksenTila: jonosijaData?.tuloksenTila as TuloksenTila | undefined,
    muutoksenSyy: mapKeys(jarjestyskriteeri?.kuvaus ?? {}, (key) =>
      key.toLowerCase(),
    ),
  };
};

export const selectLasketutValinnanvaiheet = <
  HakemusOut extends Record<string, unknown> = Record<string, unknown>,
  HakemusIn extends { hakemusOid: string; hakijaOid: string } = {
    hakemusOid: string;
    hakijaOid: string;
  },
>({
  lasketutValinnanvaiheet,
  valinnanvaiheetIlmanLaskentaa,
  hakemukset,
  selectHakemusFields,
}: {
  lasketutValinnanvaiheet: Array<LaskettuValinnanVaiheModel>;
  valinnanvaiheetIlmanLaskentaa: Array<Valinnanvaihe>;
  hakemukset: Array<HakemusIn>;
  selectHakemusFields?: (hakemusOid: string) => HakemusOut;
}) => {
  const ilmanLaskentaaOids = map(valinnanvaiheetIlmanLaskentaa, prop('oid'));

  const lasketutJonotByOid = pipe(
    lasketutValinnanvaiheet,
    flatMap((vaihe) => vaihe.valintatapajonot ?? []),
    groupBy(prop('oid')),
  );

  const vaiheetIlmanLaskentaa = map(valinnanvaiheetIlmanLaskentaa, (vaihe) => {
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
          valmisSijoiteltavaksi:
            jono.automaattinenSijoitteluunSiirto ??
            laskettuJono?.valmisSijoiteltavaksi,
          siirretaanSijoitteluun: laskettuJono?.siirretaanSijoitteluun,
          kaytetaanKokonaispisteita: laskettuJono?.kaytetaanKokonaispisteita,
          jonosijat: pipe(
            // Jos valintalaskenta ei ole käytössä, täydennetään "tyhjät" jonosijat kaikille hakemuksille, jotta voidaan
            // näyttää kaikki hakemukset ja mahdollistaa tulosten syöttäminen käsin
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
  });

  return pipe(
    lasketutValinnanvaiheet.filter(
      (vaihe) => !ilmanLaskentaaOids.includes(vaihe.valinnanvaiheoid),
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
    (lasketutVaiheet) => concat(vaiheetIlmanLaskentaa, lasketutVaiheet),
  );
};

export const useLasketutValinnanVaiheet = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}): LasketutValinnanvaiheet<AdditionalHakemusFields> => {
  const [
    { data: hakemukset },
    { data: lasketutValinnanvaiheet },
    { data: valinnanvaiheetIlmanLaskentaa },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['getHakemukset', hakuOid, hakukohdeOid],
        queryFn: () => getHakemukset({ hakuOid, hakukohdeOid }),
      },
      hakukohteenLasketutValinnanvaiheetQueryOptions(hakukohdeOid),
      valinnanvaiheetIlmanLaskentaaQueryOptions(hakukohdeOid),
    ],
  });

  const hakemuksetByOid = indexBy(hakemukset ?? [], prop('hakemusOid'));

  return selectLasketutValinnanvaiheet<AdditionalHakemusFields>({
    lasketutValinnanvaiheet,
    valinnanvaiheetIlmanLaskentaa,
    hakemukset,
    selectHakemusFields(hakemusOid) {
      const hakemus = hakemuksetByOid[hakemusOid];
      return {
        hakijanNimi: hakemus.hakijanNimi,
        hakemuksenTila: hakemus.tila,
      };
    },
  });
};
