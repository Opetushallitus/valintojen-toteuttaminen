import {
  IlmoittautumisTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import {
  type ValinnanTulosContext,
  type ValinnanTulosChangeEvent,
  type ValinnanTulosMassChangeEvent,
  type ValinnanTulosActorRef,
} from './valinnan-tulos-machine';
import {
  isIlmoittautuminenPossible,
  isVastaanottoPossible,
  VASTAANOTTOTILAT_JOISSA_VOI_ILMOITTAUTUA,
} from '@/lib/sijoittelun-tulokset-utils';
import { clone } from 'remeda';
import { useSelector } from '@xstate/react';
import { HakemuksenValinnanTulos } from '../valinta-tulos-service/valinta-tulos-types';
import { TranslatedName } from '../localization/localization-types';

type ValinnanTulosEditableFieldNames =
  | 'julkaistavissa'
  | 'valinnanTila'
  | 'valinnanTilanKuvausFI'
  | 'valinnanTilanKuvausSV'
  | 'valinnanTilanKuvausEN'
  | 'vastaanottoTila'
  | 'ilmoittautumisTila'
  | 'ehdollisestiHyvaksyttavissa'
  | 'ehdollisenHyvaksymisenEhtoKoodi'
  | 'ehdollisenHyvaksymisenEhtoFI'
  | 'ehdollisenHyvaksymisenEhtoSV'
  | 'ehdollisenHyvaksymisenEhtoEN'
  | 'hyvaksyttyVarasijalta'
  | 'maksunTila';

export type ValinnanTulosEditableFields = Partial<
  Pick<HakemuksenValinnanTulos, ValinnanTulosEditableFieldNames>
>;

const SIJOITTELUN_TULOS_EDITABLE_FIELDS: Array<ValinnanTulosEditableFieldNames> =
  [
    'julkaistavissa',
    'valinnanTila',
    'valinnanTilanKuvausFI',
    'valinnanTilanKuvausSV',
    'valinnanTilanKuvausEN',
    'vastaanottoTila',
    'ilmoittautumisTila',
    'ehdollisestiHyvaksyttavissa',
    'ehdollisenHyvaksymisenEhtoKoodi',
    'ehdollisenHyvaksymisenEhtoFI',
    'ehdollisenHyvaksymisenEhtoSV',
    'ehdollisenHyvaksymisenEhtoEN',
    'hyvaksyttyVarasijalta',
    'maksunTila',
  ] as const;

export const isUnchanged = (
  original: HakemuksenValinnanTulos,
  changed: HakemuksenValinnanTulos,
): boolean => {
  return SIJOITTELUN_TULOS_EDITABLE_FIELDS.every((fieldName) => {
    return original?.[fieldName] === changed?.[fieldName];
  });
};

export function hasChangedHakemukset<T extends HakemuksenValinnanTulos>({
  context,
}: {
  context: ValinnanTulosContext<T>;
}) {
  return context.changedHakemukset.length > 0;
}

/**
 * Tekee eventin mukaiset muokkaukset changedHakemukset-taulukkoon ja palauttaa muokatun taulukon.
 */
function applyEditsToChangedHakemukset<T extends HakemuksenValinnanTulos>({
  changedHakemukset,
  originalHakemus,
  event,
}: {
  changedHakemukset: Array<T>;
  originalHakemus: T;
  event: ValinnanTulosEditableFields;
}) {
  const changedHakenut = changedHakemukset.find(
    (h) => h.hakemusOid === originalHakemus?.hakemusOid,
  );

  const tulos = clone(changedHakenut ?? originalHakemus);

  for (const fieldName of SIJOITTELUN_TULOS_EDITABLE_FIELDS) {
    if (event?.[fieldName] !== undefined) {
      (tulos[fieldName] as string | boolean | TranslatedName) =
        event?.[fieldName];
    }
  }
  if (
    event.vastaanottoTila &&
    !VASTAANOTTOTILAT_JOISSA_VOI_ILMOITTAUTUA.includes(
      event.vastaanottoTila as VastaanottoTila,
    )
  ) {
    tulos.ilmoittautumisTila = IlmoittautumisTila.EI_TEHTY;
  }

  if (changedHakenut) {
    return isUnchanged(originalHakemus, tulos)
      ? changedHakemukset.filter((h) => h.hakemusOid !== tulos.hakemusOid)
      : changedHakemukset.map((h) =>
          h.hakemusOid === h.hakemusOid ? tulos : h,
        );
  } else {
    return [...changedHakemukset, tulos];
  }
}

export function applySingleHakemusChange<T extends HakemuksenValinnanTulos>(
  context: ValinnanTulosContext<T>,
  event: ValinnanTulosChangeEvent,
): Array<T> {
  const originalHakemus = context.hakemukset.find(
    (h) => h.hakemusOid === event.hakemusOid,
  );

  if (originalHakemus) {
    return applyEditsToChangedHakemukset({
      changedHakemukset: context.changedHakemukset,
      originalHakemus: originalHakemus!,
      event,
    });
  }
  return context.changedHakemukset;
}

export function applyMassHakemusChanges<T extends HakemuksenValinnanTulos>(
  context: ValinnanTulosContext<T>,
  event: ValinnanTulosMassChangeEvent,
) {
  let changed: Array<T> = context.changedHakemukset;
  let changedAmount = 0;
  event.hakemusOids.forEach((hakemusOid) => {
    const changedHakemus = changed.find((h) => h.hakemusOid === hakemusOid);
    const originalHakemus = context.hakemukset.find(
      (h) => h.hakemusOid === hakemusOid,
    );
    const tulos = changedHakemus ?? originalHakemus;

    if (
      tulos &&
      ((event.ilmoittautumisTila &&
        event.ilmoittautumisTila !== tulos.ilmoittautumisTila &&
        isIlmoittautuminenPossible(tulos)) ||
        (event.vastaanottoTila &&
          event.vastaanottoTila !== tulos.vastaanottoTila &&
          isVastaanottoPossible(tulos)))
    ) {
      changedAmount++;
      changed = applyEditsToChangedHakemukset({
        changedHakemukset: changed,
        originalHakemus: originalHakemus!,
        event,
      });
    }
  });
  return {
    changedHakemukset: changed,
    massChangeAmount: changedAmount,
  };
}

export const useIsDirtyValinnanTulos = <T extends HakemuksenValinnanTulos>(
  sijoittelunTulosActorRef: ValinnanTulosActorRef<T>,
) => {
  return useSelector(sijoittelunTulosActorRef, hasChangedHakemukset);
};
