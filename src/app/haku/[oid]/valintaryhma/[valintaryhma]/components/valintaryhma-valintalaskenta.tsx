'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { Divider, Stack } from '@mui/material';
import {
  LaskentaActorRef,
  LaskentaEvent,
  LaskentaEventType,
  LaskentaMachineSnapshot,
  LaskentaState,
} from '@/lib/state/laskenta-state';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { SuorittamattomatHakukohteet } from '@/components/suorittamattomat-hakukohteet';
import { LaskentaStateButton } from '@/components/laskenta-state-button';
import { ValintalaskentaStatus } from '@/components/ValintalaskentaStatus';

export const ValintaryhmanValintalaskenta = ({
  hakukohteet,
  actorRef,
  state,
  send,
}: {
  hakukohteet: Array<Hakukohde>;
  actorRef: LaskentaActorRef;
  state: LaskentaMachineSnapshot;
  send: (event: LaskentaEvent) => void;
}) => {
  const { t } = useTranslations();

  return (
    <Stack spacing={2}>
      <ConfirmationModal
        title={t('valinnanhallinta.varmista')}
        open={state.matches(LaskentaState.WAITING_CONFIRMATION)}
        onConfirm={() => send({ type: LaskentaEventType.CONFIRM })}
        onCancel={() => send({ type: LaskentaEventType.CANCEL })}
      />
      <ValintalaskentaStatus
        laskentaActorRef={actorRef}
        progressType="spinner"
      />
      <LaskentaStateButton state={state} send={send} />
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
