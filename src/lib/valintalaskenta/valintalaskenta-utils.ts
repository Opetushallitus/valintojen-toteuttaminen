import { SeurantaTiedot } from '../types/laskenta-types';
import {
  LaskentaMachineSnapshot,
  LaskentaState,
} from '../state/laskenta-state';
import { TFunction } from '../localization/useTranslations';

export const getValintatapaJonoNimi = ({
  valinnanVaiheNimi,
  jonoNimi,
}: {
  valinnanVaiheNimi?: string | null;
  jonoNimi: string;
}) => {
  if (valinnanVaiheNimi) {
    return jonoNimi.includes(valinnanVaiheNimi)
      ? jonoNimi
      : `${valinnanVaiheNimi}: ${jonoNimi}`;
  }
  return jonoNimi;
};

export const getLaskentaStatusText = (
  state: LaskentaMachineSnapshot,
  seurantaTiedot: SeurantaTiedot | null,
  t: TFunction,
) => {
  const canceling = state.context.canceling;

  switch (true) {
    case canceling:
      return `${t('valintalaskenta.keskeytetaan-laskentaa')} `;
    case state.matches(LaskentaState.STARTING) ||
      (state.hasTag('started') && seurantaTiedot == null):
      return `${t('valintalaskenta.kaynnistetaan-laskentaa')} `;
    case state.hasTag('started'):
      return seurantaTiedot?.jonosija
        ? `${t('valintalaskenta.tehtava-on-laskennassa-jonosijalla')} ${seurantaTiedot?.jonosija}. `
        : `${t('valintalaskenta.tehtava-on-laskennassa-parhaillaan')}. `;
    case state.hasTag('completed'):
      return `${t('valintalaskenta.laskenta-on-paattynyt')}. `;
    default:
      return '';
  }
};
