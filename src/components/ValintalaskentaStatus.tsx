import {
  LaskentaActorRef,
  LaskentaState,
  useLaskentaError,
} from '@/lib/state/laskenta-state';
import { ErrorAlert } from './error-alert';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { ProgressBar } from './progress-bar';
import { CircularProgress, Typography } from '@mui/material';
import { getLaskentaStatusText } from '@/lib/valintalaskenta/valintalaskenta-utils';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useSelector } from '@xstate/react';
import { SeurantaTiedot } from '@/lib/types/laskenta-types';

const LaskentaProgressBar = ({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedot | null;
}) => {
  const laskentaPercent = seurantaTiedot
    ? Math.round(
        (100 *
          (seurantaTiedot?.hakukohteitaValmiina +
            seurantaTiedot?.hakukohteitaKeskeytetty)) /
          seurantaTiedot?.hakukohteitaYhteensa,
      )
    : 0;
  return <ProgressBar value={laskentaPercent} />;
};

export function ValintalaskentaStatus({
  laskentaActorRef,
  progressType,
}: {
  laskentaActorRef: LaskentaActorRef;
  progressType: 'bar' | 'spinner';
}) {
  const { t } = useTranslations();

  const laskentaError = useLaskentaError(laskentaActorRef);

  const state = useSelector(laskentaActorRef, (s) => s);
  const seurantaTiedot = useSelector(
    laskentaActorRef,
    (s) => s.context.seurantaTiedot,
  );

  switch (true) {
    case state.matches({ [LaskentaState.IDLE]: LaskentaState.ERROR }):
      return (
        <ErrorAlert
          title={t('valintalaskenta.valintalaskenta-epaonnistui')}
          message={laskentaError}
        />
      );
    case state.hasTag('started') || state.hasTag('completed'):
      return (
        <>
          <OphTypography variant="h4">
            {t('valintalaskenta.valintalaskenta')}
          </OphTypography>
          {progressType === 'bar' ? (
            <LaskentaProgressBar seurantaTiedot={seurantaTiedot} />
          ) : (
            state.matches(LaskentaState.PROCESSING) && (
              <CircularProgress aria-label={t('valinnanhallinta.lasketaan')} />
            )
          )}
          <Typography>
            {getLaskentaStatusText(state, seurantaTiedot, t)}
            {seurantaTiedot &&
              `${t('valintalaskenta.hakukohteita-valmiina')} ${seurantaTiedot.hakukohteitaValmiina}/${seurantaTiedot.hakukohteitaYhteensa}. ` +
                `${t('valintalaskenta.suorittamattomia-hakukohteita')} ${seurantaTiedot?.hakukohteitaKeskeytetty ?? 0}.`}
          </Typography>
        </>
      );
    default:
      return null;
  }
}
