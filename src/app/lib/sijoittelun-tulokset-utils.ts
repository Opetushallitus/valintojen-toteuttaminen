import { isKorkeakouluHaku } from '@/app/lib/kouta';
import { HaunAsetukset } from '@/app/lib/types/haun-asetukset';
import { Haku } from '@/app/lib/types/kouta-types';
import {
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { TFunction } from 'i18next';
import { isNonNullish } from 'remeda';

const VASTAANOTTOTILAT_JOILLE_NAYTETAAN_ILMOITTAUTUMISTILA = [
  VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
];

type SijoittelunTilaKentat = Pick<
  SijoittelunHakemusValintatiedoilla,
  'julkaistavissa' | 'tila' | 'vastaanottotila'
>;

const isSijoittelunTilaVastaanotettavissa = (hakemuksenTila: SijoittelunTila) =>
  [
    SijoittelunTila.HYVAKSYTTY,
    SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
    SijoittelunTila.PERUNUT,
    SijoittelunTila.PERUUTETTU,
  ].includes(hakemuksenTila);

export const isVastaanottoPossible = (h: SijoittelunTilaKentat): boolean =>
  isSijoittelunTilaVastaanotettavissa(h.tila) && h.julkaistavissa;

export const isImoittautuminenPossible = (h: SijoittelunTilaKentat): boolean =>
  isSijoittelunTilaVastaanotettavissa(h.tila) &&
  VASTAANOTTOTILAT_JOILLE_NAYTETAAN_ILMOITTAUTUMISTILA.includes(
    h.vastaanottotila,
  );

export const canHakuBePublished = (
  haku: Haku,
  haunAsetukset: HaunAsetukset,
): boolean =>
  Boolean(
    isKorkeakouluHaku(haku) ||
      (haunAsetukset.valintaEsityksenHyvaksyminen &&
        new Date() >= haunAsetukset.valintaEsityksenHyvaksyminen),
  );

export const isVastaanottotilaJulkaistavissa = (
  h: SijoittelunTilaKentat,
): boolean =>
  h.vastaanottotila === VastaanottoTila.KESKEN ||
  h.vastaanottotila === VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA;

export const isHyvaksyttyHarkinnanvaraisesti = (
  hakemus: Pick<
    SijoittelunHakemusValintatiedoilla,
    'tila' | 'hyvaksyttyHarkinnanvaraisesti'
  >,
): boolean =>
  Boolean(hakemus?.hyvaksyttyHarkinnanvaraisesti) &&
  [SijoittelunTila.HYVAKSYTTY, SijoittelunTila.VARASIJALTA_HYVAKSYTTY].includes(
    hakemus.tila,
  );

export const getReadableHakemuksenTila = (
  hakemus: {
    tila: SijoittelunTila;
    hyvaksyttyHarkinnanvaraisesti?: boolean;
    varasijanNumero?: number | null;
  },
  t: TFunction,
) => {
  switch (true) {
    case isHyvaksyttyHarkinnanvaraisesti(hakemus):
      return t('sijoitteluntila.HARKINNANVARAISESTI_HYVAKSYTTY');
    case hakemus.tila === SijoittelunTila.VARALLA &&
      isNonNullish(hakemus.varasijanNumero):
      return `${t(`sijoitteluntila.${hakemus.tila}`)} (${hakemus.varasijanNumero})`;
    default:
      return t(`sijoitteluntila.${hakemus.tila}`);
  }
};
