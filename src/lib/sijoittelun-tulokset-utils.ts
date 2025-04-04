import {
  isKorkeakouluHaku,
  isToinenAsteKohdejoukko,
} from '@/lib/kouta/kouta-service';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { Haku } from '@/lib/kouta/kouta-types';
import {
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import { isAfter } from 'date-fns';
import { isNonNullish } from 'remeda';
import { toFinnishDate } from './time-utils';
import { UserPermissions } from './permissions';
import { TFunction } from './localization/useTranslations';

export const VASTAANOTTOTILAT_JOISSA_VOI_ILMOITTAUTUA = [
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

export const isIlmoittautuminenPossible = (h: SijoittelunTilaKentat): boolean =>
  isSijoittelunTilaVastaanotettavissa(h.tila) &&
  VASTAANOTTOTILAT_JOISSA_VOI_ILMOITTAUTUA.includes(h.vastaanottotila);

export const isValintaesitysJulkaistavissa = (
  haku: Haku,
  permissions: UserPermissions,
  haunAsetukset: HaunAsetukset,
): boolean =>
  Boolean(
    permissions.hasOphCRUD ||
      isKorkeakouluHaku(haku) ||
      (haunAsetukset.valintaEsityksenHyvaksyminen &&
        isAfter(
          toFinnishDate(new Date()),
          haunAsetukset.valintaEsityksenHyvaksyminen,
        )),
  );

export const isVastaanottotilaJulkaistavissa = (h: {
  vastaanottotila: VastaanottoTila;
}): boolean =>
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

export const isKirjeidenMuodostaminenAllowed = (
  haku: Haku,
  permissions: UserPermissions,
  kaikkiJonotHyvaksytty: boolean,
) => {
  return (
    !isToinenAsteKohdejoukko(haku) ||
    permissions.hasOphCRUD ||
    kaikkiJonotHyvaksytty
  );
};

export const isSendVastaanottoPostiVisible = (
  haku: Haku,
  permissions: UserPermissions,
) => {
  return !isToinenAsteKohdejoukko(haku) || permissions.hasOphCRUD;
};
