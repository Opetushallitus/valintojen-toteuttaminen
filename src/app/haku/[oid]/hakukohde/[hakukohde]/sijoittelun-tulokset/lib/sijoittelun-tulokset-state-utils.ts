import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import {
  type SijoittelunTulosEditableFields,
  type SijoittelunTuloksetContext,
  type SijoittelunTulosChangeEvent,
  type SijoittelunTulosMassChangeEvent,
  type SijoittelunTulosActorRef,
} from './sijoittelun-tulokset-state';
import {
  isIlmoittautuminenPossible,
  isVastaanottoPossible,
  VASTAANOTTOTILAT_JOISSA_VOI_ILMOITTAUTUA,
} from '@/lib/sijoittelun-tulokset-utils';
import { clone } from 'remeda';
import { useSelector } from '@xstate/react';

const SIJOITTELUN_TULOS_EDITABLE_FIELDS = [
  'julkaistavissa',
  'ehdollisestiHyvaksyttavissa',
  'ehdollisenHyvaksymisenEhtoKoodi',
  'ehdollisenHyvaksymisenEhtoFI',
  'ehdollisenHyvaksymisenEhtoSV',
  'ehdollisenHyvaksymisenEhtoEN',
  'hyvaksyttyVarasijalta',
  'vastaanottotila',
  'ilmoittautumisTila',
  'maksunTila',
] as const;

export const isUnchanged = (
  original: SijoittelunHakemusValintatiedoilla,
  changed: SijoittelunHakemusValintatiedoilla,
): boolean => {
  return SIJOITTELUN_TULOS_EDITABLE_FIELDS.every((fieldName) => {
    return original[fieldName] === changed[fieldName];
  });
};

export const hasChangedHakemukset = ({
  context,
}: {
  context: SijoittelunTuloksetContext;
}) => context.changedHakemukset.length > 0;

/**
 * Tekee eventin mukaiset muokkaukset changedHakemukset-taulukkoon ja palauttaa muokatun taulukon.
 */
const applyEditsToChangedHakemukset = ({
  changedHakemukset,
  originalHakenut,
  event,
}: {
  changedHakemukset: SijoittelunTuloksetContext['changedHakemukset'];
  originalHakenut: SijoittelunHakemusValintatiedoilla;
  event: SijoittelunTulosEditableFields;
}) => {
  const changedHakenut = changedHakemukset.find(
    (h) => h.hakemusOid === originalHakenut?.hakemusOid,
  );

  const hakenut = clone(changedHakenut ?? originalHakenut);

  for (const fieldName of SIJOITTELUN_TULOS_EDITABLE_FIELDS) {
    if (event[fieldName] !== undefined) {
      (hakenut[fieldName] as string | boolean) = event[fieldName];
    }
  }
  if (
    event.vastaanottotila &&
    !VASTAANOTTOTILAT_JOISSA_VOI_ILMOITTAUTUA.includes(
      event.vastaanottotila as VastaanottoTila,
    )
  ) {
    hakenut.ilmoittautumisTila = IlmoittautumisTila.EI_TEHTY;
  }

  if (changedHakenut) {
    return isUnchanged(originalHakenut, hakenut)
      ? changedHakemukset.filter((h) => h.hakemusOid !== hakenut.hakemusOid)
      : changedHakemukset.map((h) =>
          h.hakemusOid === h.hakemusOid ? hakenut : h,
        );
  } else {
    return [...changedHakemukset, hakenut];
  }
};

export const applySingleHakemusChange = (
  context: SijoittelunTuloksetContext,
  event: SijoittelunTulosChangeEvent,
): Array<SijoittelunHakemusValintatiedoilla> => {
  const originalHakenut = context.hakemukset.find(
    (h) => h.hakemusOid === event.hakemusOid,
  );

  if (originalHakenut) {
    return applyEditsToChangedHakemukset({
      changedHakemukset: context.changedHakemukset,
      originalHakenut: originalHakenut!,
      event,
    });
  }
  return context.changedHakemukset;
};

export const applyMassHakemusChanges = (
  context: SijoittelunTuloksetContext,
  event: SijoittelunTulosMassChangeEvent,
) => {
  let changed: Array<SijoittelunHakemusValintatiedoilla> =
    context.changedHakemukset;
  let changedAmount = 0;
  event.hakemusOids.forEach((hakemusOid) => {
    const changedHakenut = changed.find((h) => h.hakemusOid === hakemusOid);
    const originalHakenut = context.hakemukset.find(
      (h) => h.hakemusOid === hakemusOid,
    );
    const hakenut = changedHakenut ?? originalHakenut;

    if (
      hakenut &&
      ((event.ilmoittautumisTila &&
        event.ilmoittautumisTila !== hakenut.ilmoittautumisTila &&
        isIlmoittautuminenPossible(hakenut)) ||
        (event.vastaanottotila &&
          event.vastaanottotila !== hakenut.vastaanottotila &&
          isVastaanottoPossible(hakenut)))
    ) {
      changedAmount++;
      changed = applyEditsToChangedHakemukset({
        changedHakemukset: changed,
        originalHakenut: originalHakenut!,
        event,
      });
    }
  });
  return {
    changedHakemukset: changed,
    massChangeAmount: changedAmount,
  };
};

export const useIsDirtySijoittelunTulos = (
  sijoittelunTulosActorRef: SijoittelunTulosActorRef,
) => {
  return useSelector(sijoittelunTulosActorRef, hasChangedHakemukset);
};
