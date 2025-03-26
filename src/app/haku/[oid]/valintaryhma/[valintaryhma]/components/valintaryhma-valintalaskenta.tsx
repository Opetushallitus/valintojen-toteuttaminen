'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { Divider, Stack } from '@mui/material';
import { LaskentaActorRef, useLaskentaApi } from '@/lib/state/laskenta-state';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { OphButton } from '@opetushallitus/oph-design-system';
import { ValintalaskentaResult } from '@/components/ValintalaskentaResult';

export const ValintaryhmanValintalaskenta = ({
  hakukohteet,
  actorRef,
}: {
  hakukohteet: Array<Hakukohde>;
  actorRef: LaskentaActorRef;
}) => {
  const { state, startLaskenta } = useLaskentaApi(actorRef);

  const { t } = useTranslations();

  return (
    <Stack spacing={2}>
      {state.hasTag('stopped') && !state.hasTag('completed') && (
        <OphButton variant="contained" onClick={startLaskenta}>
          {t('valintalaskenta.suorita-valintalaskenta')}
        </OphButton>
      )}
      <ValintalaskentaResult
        actorRef={actorRef}
        hakukohteet={hakukohteet}
        progressType="spinner"
      />
      {(state.hasTag('started') || state.hasTag('completed')) && (
        <Divider sx={{ paddingTop: 1 }} />
      )}
    </Stack>
  );
};
