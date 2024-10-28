import { isKorkeakouluHaku } from '@/app/lib/kouta';
import { HaunAsetukset } from '@/app/lib/types/haun-asetukset';
import { Haku } from '@/app/lib/types/kouta-types';
import {
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';

const VASTAANOTTOTILAT_JOILLE_NAYTETAAN_ILMOITTAUTUMISTILA = [
  VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
];

export const hakemukselleNaytetaanVastaanottoTila = (
  h: SijoittelunHakemusValintatiedoilla,
): boolean => h.naytetaanVastaanottoTieto && h.julkaistavissa;

export const hakemukselleNaytetaanIlmoittautumisTila = (
  h: SijoittelunHakemusValintatiedoilla,
): boolean =>
  h.naytetaanVastaanottoTieto &&
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
  h: SijoittelunHakemusValintatiedoilla,
): boolean =>
  h.vastaanottotila === VastaanottoTila.KESKEN ||
  h.vastaanottotila === VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA;
