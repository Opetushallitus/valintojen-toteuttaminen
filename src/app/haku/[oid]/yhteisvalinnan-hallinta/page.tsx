'use client';
import { AccordionBox } from '@/components/accordion-box';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { FullClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { SuorittamattomatHakukohteet } from '@/components/suorittamattomat-hakukohteet';
import { ValintalaskentaStatus } from '@/components/ValintalaskentaStatus';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { buildLinkToHaku } from '@/lib/ataru/ataru-service';
import { configuration } from '@/lib/configuration';
import { getHakukohteetQueryOptions } from '@/lib/kouta/kouta-service';
import { Haku } from '@/lib/kouta/kouta-types';
import { useHaku } from '@/lib/kouta/useHaku';
import { useTranslations } from '@/lib/localization/useTranslations';
import { withDefaultProps } from '@/lib/mui-utils';
import { useHaunAsetukset } from '@/lib/ohjausparametrit/useHaunAsetukset';
import {
  LaskentaState,
  useLaskentaState,
  useLaskentaTitle,
} from '@/lib/state/laskenta-state';
import { styled } from '@/lib/theme';
import { Stack } from '@mui/material';
import { OphButton, OphLink } from '@opetushallitus/oph-design-system';
import { useSuspenseQuery } from '@tanstack/react-query';
import { use } from 'react';

const LaskentaButton = withDefaultProps(
  styled(OphButton)({
    alignSelf: 'flex-start',
  }),
  {
    variant: 'contained',
  },
);

const ValintalaskentaAccordionContent = ({ haku }: { haku: Haku }) => {
  const { t } = useTranslations();

  const { data: userPermissions } = useUserPermissions();

  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid: haku.oid });
  const { data: hakukohteet } = useSuspenseQuery(
    getHakukohteetQueryOptions(haku.oid, userPermissions),
  );

  const {
    actorRef,
    state,
    startLaskenta,
    confirm,
    cancel,
    reset,
    isCanceling,
    isLaskentaResultVisible,
  } = useLaskentaState({
    haku,
    haunAsetukset,
    hakukohteet: null,
  });

  const laskentaTitle = useLaskentaTitle(actorRef);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-start" spacing={3}>
        <OphButton
          disabled={state.hasTag('started')}
          variant="contained"
          onClick={() =>
            startLaskenta({
              haku,
              haunAsetukset,
              hakukohteet: null,
              valintakoelaskenta: true,
            })
          }
        >
          {t('yhteisvalinnan-hallinta.valintakoelaskenta-haulle')}
        </OphButton>
        <OphButton
          disabled={state.hasTag('started')}
          variant="contained"
          onClick={() =>
            startLaskenta({
              haku,
              haunAsetukset,
              hakukohteet: null,
              valinnanvaiheNumber: -1,
            })
          }
        >
          {t('yhteisvalinnan-hallinta.valintalaskenta')}
        </OphButton>
        <OphButton
          disabled={state.hasTag('started')}
          variant="contained"
          onClick={() =>
            startLaskenta({
              haku,
              haunAsetukset,
              hakukohteet: null,
            })
          }
        >
          {t('yhteisvalinnan-hallinta.kaikki-laskennat-haulle')}
        </OphButton>
      </Stack>
      <ConfirmationModal
        title={t('valinnanhallinta.varmista')}
        open={state.matches(LaskentaState.WAITING_CONFIRMATION)}
        onConfirm={confirm}
        onCancel={cancel}
      />
      <ValintalaskentaStatus
        title={t(laskentaTitle)}
        laskentaActorRef={actorRef}
        progressType="bar"
      />
      {isLaskentaResultVisible && (
        <SuorittamattomatHakukohteet
          actorRef={actorRef}
          hakukohteet={hakukohteet}
          onlyErrors={true}
        />
      )}
      {state.hasTag('started') && (
        <LaskentaButton
          variant="outlined"
          disabled={isCanceling || state.matches(LaskentaState.STARTING)}
          onClick={cancel}
        >
          {t('valintalaskenta.keskeyta-valintalaskenta')}
        </LaskentaButton>
      )}
      {isLaskentaResultVisible && (
        <LaskentaButton key="sulje" variant="outlined" onClick={reset}>
          {t('valintalaskenta.sulje-laskennan-tiedot')}
        </LaskentaButton>
      )}
    </Stack>
  );
};

const YhteisvalinnanHallintaContent = ({ hakuOid }: { hakuOid: string }) => {
  const { data: haku } = useHaku({ hakuOid });

  const { t, translateEntity } = useTranslations();

  return (
    <>
      <Stack direction="row" spacing="4vw" sx={{ paddingTop: 1 }}>
        <LabeledInfoItem
          label={t('yleinen.haku')}
          value={translateEntity(haku.nimi)}
        />
        <LabeledInfoItem label={t('yleinen.haun-tunniste')} value={haku.oid} />
        <LabeledInfoItem
          label={t('yleinen.lisatiedot')}
          value={
            <Stack direction="row" spacing={3}>
              <OphLink
                href={configuration.haunAsetuksetLinkUrl({ hakuOid: haku.oid })}
              >
                {t('yleinen.haun-asetukset')}
              </OphLink>
              <ExternalLink
                name={t('yleinen.tarjonta')}
                href={buildLinkToHaku(haku.oid)}
              />
            </Stack>
          }
        />
      </Stack>
      <AccordionBox
        id="yhteisvalinnan-hallinta-valintalaskenta"
        headingComponent="h2"
        title={
          <AccordionBoxTitle
            title={t('yhteisvalinnan-hallinta.valintalaskenta')}
          />
        }
      >
        <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
          <ValintalaskentaAccordionContent haku={haku} />
        </QuerySuspenseBoundary>
      </AccordionBox>
    </>
  );
};

export default function YhteisvalinnanHallintaPage(props: {
  params: Promise<{ oid: string }>;
}) {
  const params = use(props.params);
  const hakuOid = params.oid;

  return (
    <Stack spacing={2} sx={{ margin: 4, overflowX: 'hidden' }}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <YhteisvalinnanHallintaContent hakuOid={hakuOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
