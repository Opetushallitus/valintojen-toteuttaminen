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
