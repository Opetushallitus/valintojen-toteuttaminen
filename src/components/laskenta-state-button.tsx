import { useTranslations } from '@/lib/localization/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import { withDefaultProps } from '@/lib/mui-utils';
import {
  LaskentaEvent,
  LaskentaEventType,
  LaskentaMachineSnapshot,
} from '@/lib/state/laskenta-state';
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
  state,
  send,
}: {
  state: LaskentaMachineSnapshot;
  send: (event: LaskentaEvent) => void;
}) => {
  const { t } = useTranslations();

  switch (true) {
    case state.hasTag('stopped') && !state.hasTag('completed'):
      return (
        <LaskentaButton
          key="suorita"
          onClick={() => {
            send({ type: LaskentaEventType.START });
          }}
        >
          {t('valintalaskenta.suorita-valintalaskenta')}
        </LaskentaButton>
      );
    case state.hasTag('started'):
      return (
        <LaskentaButton
          key="keskeyta"
          variant="outlined"
          disabled={state.hasTag('canceling')}
          onClick={() => {
            send({ type: LaskentaEventType.CANCEL });
          }}
        >
          {t('valintalaskenta.keskeyta-valintalaskenta')}
        </LaskentaButton>
      );
    case state.hasTag('completed'):
      return (
        <LaskentaButton
          key="sulje"
          variant="outlined"
          onClick={() => {
            send({ type: LaskentaEventType.RESET_RESULTS });
          }}
        >
          {t('valintalaskenta.sulje-laskennan-tiedot')}
        </LaskentaButton>
      );
    default:
      return null;
  }
};
