'use client';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { SuorittamattomatHakukohteet } from '@/components/suorittamattomat-hakukohteet';
import { ValintalaskentaStatus } from '@/components/ValintalaskentaStatus';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  LaskentaActorRef,
  useLaskentaApi,
  useLaskentaTitle,
  LaskentaState,
} from '@/lib/state/laskenta-state';
import { OphButton } from '@opetushallitus/oph-design-system';
import { toLowerCase } from 'remeda';

export const ValintalaskentaResult = ({
  actorRef,
  hakukohteet,
  progressType,
}: {
  actorRef: LaskentaActorRef;
  hakukohteet: Array<Hakukohde>;
  progressType: 'bar' | 'spinner';
}) => {
  const { t } = useTranslations();

  const { state, isCanceling, resetLaskenta, confirmLaskenta, cancelLaskenta } =
    useLaskentaApi(actorRef);

  const startingLaskentaTitle = useLaskentaTitle(actorRef, 'current');
  const resultLaskentaTitle = useLaskentaTitle(actorRef, 'result');

  return (
    <>
      <ConfirmationModal
        title={`${t('yleinen.kaynnistetaanko')} ${toLowerCase(startingLaskentaTitle)}?`}
        open={state.hasTag('waiting-confirmation')}
        onConfirm={confirmLaskenta}
        onCancel={cancelLaskenta}
      />
      <ValintalaskentaStatus
        title={resultLaskentaTitle}
        laskentaActorRef={actorRef}
        progressType={progressType}
      />
      {state.hasTag('started') && (
        <OphButton
          variant="outlined"
          disabled={isCanceling || state.matches(LaskentaState.STARTING)}
          onClick={cancelLaskenta}
        >
          {t('valintalaskenta.keskeyta-valintalaskenta')}
        </OphButton>
      )}
      {state.hasTag('result') && (
        <>
          <OphButton variant="outlined" onClick={resetLaskenta}>
            {t('valintalaskenta.sulje-laskennan-tiedot')}
          </OphButton>
          <SuorittamattomatHakukohteet
            actorRef={actorRef}
            hakukohteet={hakukohteet}
            onlyErrors={true}
          />
        </>
      )}
    </>
  );
};
