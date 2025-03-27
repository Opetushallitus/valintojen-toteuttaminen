'use client';

import { Divider, Stack } from '@mui/material';
import { useLaskentaState } from '@/lib/state/laskenta-state';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { Haku } from '@/lib/kouta/kouta-types';
import { useTranslations } from '@/lib/localization/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import { ValintalaskentaResult } from '@/components/ValintalaskentaResult';

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

  const { actorRef, state, startLaskentaWithParams } = useLaskentaState();

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      {state.hasTag('stopped') && !state.hasTag('completed') && (
        <OphButton
          variant="contained"
          onClick={() =>
            startLaskentaWithParams({
              haku,
              haunAsetukset,
              hakukohteet,
            })
          }
        >
          {t('valintalaskenta.suorita-valintalaskenta')}
        </OphButton>
      )}
      <ValintalaskentaResult
        actorRef={actorRef}
        hakukohteet={hakukohteet}
        progressType="bar"
      />
      {(state.hasTag('started') || state.hasTag('completed')) && (
        <Divider sx={{ paddingTop: 1 }} />
      )}
    </Stack>
  );
};
