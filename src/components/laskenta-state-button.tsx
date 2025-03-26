import { useTranslations } from '@/lib/localization/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import { withDefaultProps } from '@/lib/mui-utils';
import { LaskentaActorRef, useLaskentaApi } from '@/lib/state/laskenta-state';
import { styled } from '@/lib/theme';

const LaskentaButton = withDefaultProps(
  styled(OphButton)({
    alignSelf: 'flex-start',
  }),
  {
    variant: 'contained',
  },
);

export const LaskentaStateButton = ({
  actorRef,
}: {
  actorRef: LaskentaActorRef;
}) => {
  const { state, startLaskenta, cancelLaskenta, resetLaskenta } =
    useLaskentaApi(actorRef);

  const { t } = useTranslations();
  const canceling = state.context.canceling;

  switch (true) {
    case state.hasTag('stopped') && !state.hasTag('completed'):
      return (
        <LaskentaButton key="suorita" onClick={startLaskenta}>
          {t('valintalaskenta.suorita-valintalaskenta')}
        </LaskentaButton>
      );
    case state.hasTag('started'):
      return (
        <LaskentaButton
          key="keskeyta"
          variant="outlined"
          disabled={canceling}
          onClick={cancelLaskenta}
        >
          {t('valintalaskenta.keskeyta-valintalaskenta')}
        </LaskentaButton>
      );
    case state.hasTag('completed'):
      return (
        <LaskentaButton key="sulje" variant="outlined" onClick={resetLaskenta}>
          {t('valintalaskenta.sulje-laskennan-tiedot')}
        </LaskentaButton>
      );
    default:
      return null;
  }
};
