import {
  IlmoittautumisTila,
  ValinnanTila,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import { type ValinnanTulosActorRef } from './createValinnanTuloksetMachine';
import {
  isIlmoittautuminenPossible,
  isVastaanottoPossible,
  VASTAANOTTOTILAT_JOISSA_VOI_ILMOITTAUTUA,
} from '@/lib/sijoittelun-tulokset-utils';
import { clone } from 'remeda';
import { useSelector } from '@xstate/react';
import { HakemuksenValinnanTulos } from '../valinta-tulos-service/valinta-tulos-types';
import {
  ValinnanTulosChangeEvent,
  ValinnanTulosContext,
  ValinnanTulosEditableFieldNames,
  ValinnanTulosEditableFields,
  ValinnanTulosMassChangeEvent,
} from './valinnanTuloksetMachineTypes';

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

const VASTAANOTTOTILA_TO_VALINNAN_TILA = Object.freeze({
  [VastaanottoTila.VASTAANOTTANUT_SITOVASTI]: ValinnanTila.HYVAKSYTTY,
  [VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA]: ValinnanTila.PERUNUT,
  [VastaanottoTila.PERUNUT]: ValinnanTila.PERUNUT,
  [VastaanottoTila.PERUUTETTU]: ValinnanTila.PERUUTETTU,
  [VastaanottoTila.OTTANUT_VASTAAN_TOISEN_PAIKAN]: ValinnanTila.PERUUNTUNUT,
});

/**
 * Tekee eventin mukaiset muokkaukset changedHakemukset-taulukkoon ja palauttaa muokatun taulukon.
 */
function applyEditsToChangedHakemukset<T extends HakemuksenValinnanTulos>({
  changedHakemukset,
  originalHakemus,
  event,
  mode,
}: {
  changedHakemukset: Array<T>;
  originalHakemus: T;
  event: ValinnanTulosEditableFields;
  mode: 'sijoittelu' | 'valinta';
}) {
  const changedHakemus = changedHakemukset.find(
    (h) => h.hakemusOid === originalHakemus?.hakemusOid,
  );

  const tulos = clone(changedHakemus ?? originalHakemus);

  for (const fieldName of SIJOITTELUN_TULOS_EDITABLE_FIELDS) {
    if (event?.[fieldName] !== undefined) {
      (tulos[fieldName] as string | boolean) = event?.[fieldName];
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

  if (mode === 'valinta') {
    if (event.vastaanottoTila) {
      const newValinnanTila =
        VASTAANOTTOTILA_TO_VALINNAN_TILA[
          event.vastaanottoTila as keyof typeof VASTAANOTTOTILA_TO_VALINNAN_TILA
        ];

      if (newValinnanTila) {
        tulos.valinnanTila = newValinnanTila;
      }
    }
  }

  if (changedHakemus) {
    return isUnchanged(originalHakemus, tulos)
      ? changedHakemukset.filter((h) => h.hakemusOid !== tulos.hakemusOid)
      : changedHakemukset.map((h) =>
          h.hakemusOid === tulos.hakemusOid ? tulos : h,
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
      originalHakemus,
      event,
      mode: context.mode,
    });
  }
  return context.changedHakemukset;
}

export function applyMassHakemusChanges<T extends HakemuksenValinnanTulos>(
  context: ValinnanTulosContext<T>,
  event: ValinnanTulosMassChangeEvent,
) {
  let changedHakemukset: Array<T> = clone(context.changedHakemukset);
  let changedAmount = 0;

  event.hakemusOids.forEach((hakemusOid) => {
    const changedHakemus = changedHakemukset.find(
      (h) => h.hakemusOid === hakemusOid,
    );
    const originalHakemus = context.hakemukset.find(
      (h) => h.hakemusOid === hakemusOid,
    );
    const tulos = changedHakemus ?? originalHakemus;

    if (
      tulos &&
      ((event.valinnanTila && event.valinnanTila !== tulos.valinnanTila) ||
        (event.vastaanottoTila &&
          event.vastaanottoTila !== tulos.vastaanottoTila &&
          isVastaanottoPossible(tulos)) ||
        (event.ilmoittautumisTila &&
          event.ilmoittautumisTila !== tulos.ilmoittautumisTila &&
          isIlmoittautuminenPossible(tulos)))
    ) {
      changedAmount++;
      changedHakemukset = applyEditsToChangedHakemukset({
        changedHakemukset,
        originalHakemus: originalHakemus!,
        event,
        mode: context.mode,
      });
    }
  });

  return {
    changedHakemukset: changedHakemukset,
    massChangeAmount: changedAmount,
  };
}

export function prepareChangedHakemuksetForSave<
  T extends HakemuksenValinnanTulos,
>(changedHakemukset: Array<T>) {
  return changedHakemukset.map((hakemus) => {
    const { valinnanTila } = hakemus;
    const result = clone(hakemus);

    if (valinnanTila === ValinnanTila.HYLATTY) {
      result.ehdollisestiHyvaksyttavissa = false;
      result.ehdollisenHyvaksymisenEhtoKoodi = '';
      result.ehdollisenHyvaksymisenEhtoEN = '';
      result.ehdollisenHyvaksymisenEhtoEN = '';
      result.ehdollisenHyvaksymisenEhtoEN = '';
    }
    if (valinnanTila !== ValinnanTila.HYLATTY) {
      result.valinnanTilanKuvausFI = '';
      result.valinnanTilanKuvausSV = '';
      result.valinnanTilanKuvausEN = '';
    }
    return result;
  });
}

export const useIsDirtyValinnanTulos = <T extends HakemuksenValinnanTulos>(
  sijoittelunTulosActorRef: ValinnanTulosActorRef<T>,
) => {
  return useSelector(sijoittelunTulosActorRef, hasChangedHakemukset);
};
