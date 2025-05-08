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
import { ValinnanTulosFields } from '../valinta-tulos-service/valinta-tulos-types';
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
  Pick<ValinnanTulosFields, ValinnanTulosEditableFieldNames>
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
  original: ValinnanTulosFields,
  changed: ValinnanTulosFields,
): boolean => {
  return SIJOITTELUN_TULOS_EDITABLE_FIELDS.every((fieldName) => {
    return original?.[fieldName] === changed?.[fieldName];
  });
};

export function hasChangedHakemukset<T extends ValinnanTulosFields>({
  context,
}: {
  context: ValinnanTulosContext<T>;
}) {
  return context.changedTulokset.length > 0;
}

/**
 * Tekee eventin mukaiset muokkaukset changedHakemukset-taulukkoon ja palauttaa muokatun taulukon.
 */
function applyEditsToChangedHakemukset<T extends ValinnanTulosFields>({
  changedTulokset: changedHakemukset,
  originalTulos: originalHakenut,
  event,
}: {
  changedTulokset: Array<T>;
  originalTulos: T;
  event: ValinnanTulosEditableFields;
}) {
  const changedHakenut = changedHakemukset.find(
    (h) => h.hakemusOid === originalHakenut?.hakemusOid,
  );

  const tulos = clone(changedHakenut ?? originalHakenut);

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
    return isUnchanged(originalHakenut, tulos)
      ? changedHakemukset.filter((h) => h.hakemusOid !== tulos.hakemusOid)
      : changedHakemukset.map((h) =>
          h.hakemusOid === h.hakemusOid ? tulos : h,
        );
  } else {
    return [...changedHakemukset, tulos];
  }
}

export function applySingleHakemusChange<T extends ValinnanTulosFields>(
  context: ValinnanTulosContext<T>,
  event: ValinnanTulosChangeEvent,
): Array<T> {
  const originalTulos = context.tulokset.find(
    (h) => h.hakemusOid === event.hakemusOid,
  );

  if (originalTulos) {
    return applyEditsToChangedHakemukset({
      changedTulokset: context.changedTulokset,
      originalTulos: originalTulos!,
      event,
    });
  }
  return context.changedTulokset;
}

export function applyMassHakemusChanges<T extends ValinnanTulosFields>(
  context: ValinnanTulosContext<T>,
  event: ValinnanTulosMassChangeEvent,
) {
  let changed: Array<T> = context.changedTulokset;
  let changedAmount = 0;
  event.hakemusOids.forEach((hakemusOid) => {
    const changedTulos = changed.find((h) => h.hakemusOid === hakemusOid);
    const originalTulos = context.tulokset.find(
      (h) => h.hakemusOid === hakemusOid,
    );
    const tulos = changedTulos ?? originalTulos;

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
        changedTulokset: changed,
        originalTulos: originalTulos!,
        event,
      });
    }
  });
  return {
    changedHakemukset: changed,
    massChangeAmount: changedAmount,
  };
}

export const useIsDirtyValinnanTulos = <T extends ValinnanTulosFields>(
  sijoittelunTulosActorRef: ValinnanTulosActorRef<T>,
) => {
  return useSelector(sijoittelunTulosActorRef, hasChangedHakemukset);
};
