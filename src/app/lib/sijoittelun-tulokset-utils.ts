import { isKorkeakouluHaku } from '@/app/lib/kouta';
import { HaunAsetukset } from '@/app/lib/types/haun-asetukset';
import { Haku } from '@/app/lib/types/kouta-types';
import {
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';

const VASTAANOTTOTILAT_JOILLE_NAYTETAAN_ILMOITTAUTUMISTILA = [
  VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
];

type SijoittelunTilaKentat = Pick<
  SijoittelunHakemusValintatiedoilla,
  'julkaistavissa' | 'tila' | 'vastaanottotila'
>;

const isVastaanotettavissa = (hakemuksenTila: SijoittelunTila) =>
  [
    SijoittelunTila.HYVAKSYTTY,
    SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
    SijoittelunTila.PERUNUT,
    SijoittelunTila.PERUUTETTU,
  ].includes(hakemuksenTila);

export const isVastaanottotilaEditable = (h: SijoittelunTilaKentat): boolean =>
  isVastaanotettavissa(h.tila) && h.julkaistavissa;

export const isIlmoittautumistilaEditable = (
  h: SijoittelunTilaKentat,
): boolean =>
  isVastaanotettavissa(h.tila) &&
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

export const hakemusVastaanottotilaJulkaistavissa = (
  h: SijoittelunTilaKentat,
): boolean =>
  h.vastaanottotila === VastaanottoTila.KESKEN ||
  h.vastaanottotila === VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA;