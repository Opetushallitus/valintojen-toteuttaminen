'use client';
import { SpinnerModal } from '@/components/modals/spinner-modal';
import { useTranslations } from '@/lib/localization/useTranslations';
import { ValinnanTulosActorRef } from '@/lib/state/createValinnanTuloksetMachine';
import { ValinnanTulosState } from '@/lib/state/valinnanTuloksetMachineTypes';
import { useSelector } from '@xstate/react';

export const ValinnanTuloksetSpinnerModal = ({
  actorRef,
}: {
  actorRef: ValinnanTulosActorRef;
}) => {
  const state = useSelector(actorRef, (s) => s);
  const { t } = useTranslations();

  let spinnerTitle;
  if (state.matches(ValinnanTulosState.REMOVING)) {
    spinnerTitle = t('valinnan-tulokset.poistetaan-tuloksia');
  } else if (state.matches(ValinnanTulosState.PUBLISHING)) {
    spinnerTitle = t('valinnan-tulokset.hyvaksytaan-valintaesitysta');
  } else if (state.matches(ValinnanTulosState.UPDATING)) {
    spinnerTitle = t('valinnan-tulokset.tallennetaan-tuloksia');
  }

  return (
    <SpinnerModal
      title={spinnerTitle ?? ''}
      open={Boolean(spinnerTitle && state.hasTag('saving'))}
    />
  );
};
