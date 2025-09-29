import {
  isKorkeakouluHaku,
  isToinenAsteKohdejoukko,
} from '@/lib/kouta/kouta-service';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { Haku } from '@/lib/kouta/kouta-types';
import {
  SijoittelunHakemusValintatiedoilla,
  ValinnanTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import { isAfter } from 'date-fns';
import { isDefined, isNonNullish, isTruthy } from 'remeda';
import { toFinnishDate } from './time-utils';
import { UserPermissions } from './permissions';
import { TFunction } from './localization/useTranslations';

export const VASTAANOTTOTILAT_JOISSA_VOI_ILMOITTAUTUA = [
  VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
];

type SijoittelunTilaKentat = Pick<
  SijoittelunHakemusValintatiedoilla,
  'julkaistavissa' | 'valinnanTila' | 'vastaanottoTila' | 'hyvaksyPeruuntunut'
>;

const isSijoittelunTilaVastaanotettavissa = (hakemuksenTila?: ValinnanTila) =>
  [
    ValinnanTila.HYVAKSYTTY,
    ValinnanTila.VARASIJALTA_HYVAKSYTTY,
    ValinnanTila.PERUNUT,
    ValinnanTila.PERUUTETTU,
  ].includes(hakemuksenTila as ValinnanTila);

export const isVastaanottoPossible = (h: SijoittelunTilaKentat): boolean =>
  isSijoittelunTilaVastaanotettavissa(h?.valinnanTila) &&
  Boolean(h?.julkaistavissa);

export const isIlmoittautuminenPossible = (h: SijoittelunTilaKentat): boolean =>
  isSijoittelunTilaVastaanotettavissa(h.valinnanTila) &&
  VASTAANOTTOTILAT_JOISSA_VOI_ILMOITTAUTUA.includes(
    h.vastaanottoTila as VastaanottoTila,
  );

export const showHyvaksyPeruuntunut = (
  h: SijoittelunTilaKentat,
  peruuntuneenHyvaksyminenAllowed: boolean,
): boolean => {
  const hyvaksyminenAllowedAndTilaPeruuntunut =
    peruuntuneenHyvaksyminenAllowed &&
    h.valinnanTila === ValinnanTila.PERUUNTUNUT;
  const hyvaksyPeruuntunutIsSetWithAppropriateTila =
    isTruthy(h.hyvaksyPeruuntunut) &&
    isDefined(h.valinnanTila) &&
    [
      ValinnanTila.HYVAKSYTTY,
      ValinnanTila.PERUUNTUNUT,
      ValinnanTila.VARASIJALTA_HYVAKSYTTY,
    ].includes(h.valinnanTila);
  return (
    hyvaksyminenAllowedAndTilaPeruuntunut ||
    hyvaksyPeruuntunutIsSetWithAppropriateTila
  );
};

export const canHyvaksyPeruuntunut = (
  h: SijoittelunTilaKentat,
  peruuntuneenHyvaksyminenAllowed: boolean,
): boolean => peruuntuneenHyvaksyminenAllowed && !h.julkaistavissa;

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
  vastaanottoTila?: VastaanottoTila;
}): boolean =>
  h.vastaanottoTila === undefined ||
  h.vastaanottoTila === VastaanottoTila.KESKEN ||
  h.vastaanottoTila === VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA;

export const isHyvaksyttyHarkinnanvaraisesti = (
  hakemus: Pick<
    SijoittelunHakemusValintatiedoilla,
    'valinnanTila' | 'hyvaksyttyHarkinnanvaraisesti'
  >,
): boolean =>
  Boolean(hakemus?.hyvaksyttyHarkinnanvaraisesti) &&
  [ValinnanTila.HYVAKSYTTY, ValinnanTila.VARASIJALTA_HYVAKSYTTY].includes(
    hakemus.valinnanTila as ValinnanTila,
  );

export const getReadableHakemuksenTila = (
  hakemus: {
    valinnanTila?: ValinnanTila;
    hyvaksyttyHarkinnanvaraisesti?: boolean;
    varasijanNumero?: number | null;
  },
  t: TFunction,
) => {
  switch (true) {
    case isHyvaksyttyHarkinnanvaraisesti(hakemus):
      return t('sijoitteluntila.HARKINNANVARAISESTI_HYVAKSYTTY');
    case hakemus.valinnanTila === ValinnanTila.VARALLA &&
      isNonNullish(hakemus.varasijanNumero):
      return `${t(`sijoitteluntila.${hakemus.valinnanTila}`)} (${hakemus.varasijanNumero})`;
    default:
      return t(`sijoitteluntila.${hakemus.valinnanTila}`);
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
