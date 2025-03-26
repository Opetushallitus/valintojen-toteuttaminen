'use client';

import { Divider, Stack } from '@mui/material';
import { LaskentaState, useLaskentaState } from '@/lib/state/laskenta-state';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { Haku } from '@/lib/kouta/kouta-types';
import { SuorittamattomatHakukohteet } from '@/components/suorittamattomat-hakukohteet';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { LaskentaStateButton } from '@/components/laskenta-state-button';
import { ValintalaskentaStatus } from '@/components/ValintalaskentaStatus';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useEffect } from 'react';

export const HenkilonValintalaskenta = ({
  haku,
  haunAsetukset,
  hakukohteet,
}: {
  haku: Haku;
  haunAsetukset: HaunAsetukset;
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
}) => {
  const { t } = useTranslations();

  const {
    actorRef,
    state,
    confirmLaskenta,
    cancelLaskenta,
    setLaskentaParams,
  } = useLaskentaState();

  useEffect(() => {
    setLaskentaParams({
      haku,
      haunAsetukset,
      hakukohteet,
    });
  }, [setLaskentaParams, haku, haunAsetukset, hakukohteet]);

  return (
    <Stack spacing={2}>
      <ConfirmationModal
        title={t('valinnanhallinta.varmista')}
        open={state.matches(LaskentaState.WAITING_CONFIRMATION)}
        onConfirm={confirmLaskenta}
        onCancel={cancelLaskenta}
      />
      <ValintalaskentaStatus laskentaActorRef={actorRef} progressType="bar" />
      <LaskentaStateButton actorRef={actorRef} />
      {state.hasTag('completed') && (
        <SuorittamattomatHakukohteet
          actorRef={actorRef}
          hakukohteet={hakukohteet}
        />
      )}
      {(state.hasTag('started') || state.hasTag('completed')) && (
        <Divider sx={{ paddingTop: 1 }} />
      )}
    </Stack>
  );
};
