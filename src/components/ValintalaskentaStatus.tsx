import { LaskentaActorRef, useLaskentaError } from '@/lib/state/laskenta-state';
import { ErrorAlert } from './error-alert';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { ProgressBar } from './progress-bar';
import { CircularProgress, Typography } from '@mui/material';
import { getLaskentaStatusText } from '@/lib/valintalaskenta/valintalaskenta-utils';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useSelector } from '@xstate/react';
import { SeurantaTiedot } from '@/lib/types/laskenta-types';

export const LaskentaProgressBar = ({
  seurantaTiedot,
}: {
  seurantaTiedot: SeurantaTiedot | null;
}) => {
  const { t } = useTranslations();

  const getLaskentaPercent = (tiedot: SeurantaTiedot | null) => {
    if (!tiedot) return 0;
    else if (tiedot.tila === 'VALMIS' && tiedot.tyyppi === 'VALINTARYHMA')
      return 100;
    else
      return (
        100 *
        ((tiedot?.hakukohteitaValmiina + tiedot?.hakukohteitaKeskeytetty) /
          tiedot?.hakukohteitaYhteensa)
      );
  };

  const laskentaPercent = getLaskentaPercent(seurantaTiedot);
  const laskentaReady =
    seurantaTiedot &&
    seurantaTiedot?.hakukohteitaValmiina +
      seurantaTiedot?.hakukohteitaKeskeytetty ===
      seurantaTiedot?.hakukohteitaYhteensa;
  return (
    <ProgressBar
      ariaLabel={t(
        laskentaReady
          ? 'valinnanhallinta.laskenta-valmis'
          : 'valinnanhallinta.lasketaan',
      )}
      value={laskentaPercent}
    />
  );
};

export function ValintalaskentaStatus({
  title,
  laskentaActorRef,
  progressType,
}: {
  title?: string;
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

  return (
    <>
      {state.hasTag('started') || state.hasTag('completed') ? (
        <>
          <OphTypography variant="h4">
            {title ?? t('valintalaskenta.valintalaskenta')}
          </OphTypography>
          {progressType === 'bar' ? (
            <LaskentaProgressBar seurantaTiedot={seurantaTiedot} />
          ) : (
            state.hasTag('started') && (
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
      ) : null}
      {Boolean(laskentaError) && (
        <ErrorAlert
          title={t('valintalaskenta.valintalaskenta-epaonnistui')}
          message={laskentaError}
        />
      )}
    </>
  );
}
