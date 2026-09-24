import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, Typography } from '@mui/material';
import { isEmpty } from 'remeda';
import { OphButton } from '@opetushallitus/oph-design-system';
import { HakijaInfo } from '@/lib/ataru/ataru-types';
import useToaster from '@/hooks/useToaster';
import { useCallback } from 'react';
import { HenkilonHakukohdeTuloksilla } from '../lib/henkilo-page-types';
import { GenericEvent } from '@/lib/common';
import { ValintakokeenPisteet } from '@/lib/types/laskenta-types';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { useHenkilonPistesyottoState } from '../lib/henkilon-pistesyotto-state';
import { HakukohteenPisteSyotto } from './hakukohteen-pistesyotto';
import { useNavigationBlockerWithWindowEvents } from '@/hooks/useNavigationBlocker';
import { useIsPistesyottoAllowedForHaku } from '@/hooks/usePistesyottoAllowedForHaku';

export const HenkilonPistesyotto = ({
  hakuOid,
  hakija,
  hakukohteet,
  refetchPisteet,
  lastModified,
}: {
  hakuOid: string;
  hakija: HakijaInfo;
  hakukohteet: Array<HenkilonHakukohdeTuloksilla>;
  lastModified?: string;
  refetchPisteet: (options?: RefetchOptions) => Promise<
    QueryObserverResult<
      {
        lastModified?: string;
        pisteet: Record<string, Array<ValintakokeenPisteet>>;
      },
      Error
    >
  >;
}) => {
  const { t } = useTranslations();

  const { addToast } = useToaster();

  const onEvent = useCallback(
    (event: GenericEvent) => {
      if (event.type === 'success') {
        refetchPisteet();
      }
      addToast(event);
    },
    [addToast, refetchPisteet],
  );

  const {
    actorRef: pistesyottoActorRef,
    isUpdating,
    isDirty,
    savePistetiedot,
  } = useHenkilonPistesyottoState({
    hakija,
    hakukohteet,
    lastModified,
    onEvent,
  });

  const hakukohteetKokeilla = hakukohteet?.filter(
    (hakukohde) => !isEmpty(hakukohde.kokeet ?? []),
  );

  const isPisteetSaveAllowed = hakukohteetKokeilla.some(
    (hakukohde) =>
      !hakukohde.readOnly && hakukohde.pisteet && hakukohde.pisteet.length > 0,
  );

  const isPistesyottoAllowedForHaku = useIsPistesyottoAllowedForHaku(hakuOid);

  useNavigationBlockerWithWindowEvents(isDirty);

  return (
    <Box sx={{ marginTop: 3 }}>
      <Typography variant="h3">{t('henkilo.pistesyotto')}</Typography>
      <OphButton
        sx={{ margin: '0.8rem 0' }}
        variant="contained"
        loading={isUpdating}
        disabled={!isPistesyottoAllowedForHaku || !isPisteetSaveAllowed}
        onClick={() => {
          savePistetiedot();
        }}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      {hakukohteetKokeilla.map((hakukohde) => (
        <HakukohteenPisteSyotto
          key={hakukohde.oid}
          hakukohde={hakukohde}
          hakija={hakija}
          pistesyottoActorRef={pistesyottoActorRef}
          disabled={hakukohde.readOnly || !isPistesyottoAllowedForHaku}
        />
      ))}
    </Box>
  );
};
