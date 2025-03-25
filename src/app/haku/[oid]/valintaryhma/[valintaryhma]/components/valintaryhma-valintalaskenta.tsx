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
import { ErrorAlert } from '@/components/error-alert';
import { useSelector } from '@xstate/react';
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

  const summaryIlmoitus = useSelector(
    actorRef,
    (s) => s.context.summary?.ilmoitus,
  );

  return (
    <Stack spacing={2}>
      <ConfirmationModal
        open={state.matches(LaskentaState.WAITING_CONFIRMATION)}
        onConfirm={() => send({ type: LaskentaEventType.CONFIRM })}
        onCancel={() => send({ type: LaskentaEventType.CANCEL })}
      />
      <ValintalaskentaStatus
        laskentaActorRef={actorRef}
        progressType="spinner"
      />
      <LaskentaStateButton state={state} send={send} />
      {state.hasTag('completed') && summaryIlmoitus && (
        <ErrorAlert
          title={t('valinnanhallinta.virhe')}
          message={summaryIlmoitus.otsikko}
          hasAccordion={true}
        />
      )}
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
