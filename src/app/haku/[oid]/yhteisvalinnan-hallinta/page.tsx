'use client';
import { AccordionBox } from '@/components/accordion-box';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { FullClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { buildLinkToHaku } from '@/lib/ataru/ataru-service';
import { configuration } from '@/lib/configuration';
import { getHakukohteetQueryOptions } from '@/lib/kouta/kouta-service';
import { Haku } from '@/lib/kouta/kouta-types';
import { useHaku } from '@/lib/kouta/useHaku';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHaunAsetukset } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { useLaskentaState } from '@/lib/state/laskenta-state';
import { Stack } from '@mui/material';
import { OphButton, OphLink } from '@opetushallitus/oph-design-system';
import { useSuspenseQuery } from '@tanstack/react-query';
import { use } from 'react';
import { ValintalaskentaResult } from '@/components/ValintalaskentaResult';

const ValintalaskentaAccordionContent = ({ haku }: { haku: Haku }) => {
  const { t } = useTranslations();

  const { data: userPermissions } = useUserPermissions();
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid: haku.oid });
  const { data: hakukohteet } = useSuspenseQuery(
    getHakukohteetQueryOptions(haku.oid, userPermissions),
  );

  const { actorRef, state, startLaskentaWithParams } = useLaskentaState();

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Stack direction="row" spacing={3} sx={{ justifyContent: 'flex-start' }}>
        <OphButton
          disabled={state.hasTag('started')}
          variant="contained"
          onClick={() =>
            startLaskentaWithParams({
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
            startLaskentaWithParams({
              haku,
              haunAsetukset,
              hakukohteet: null,
              valinnanvaiheNumber: -1,
            })
          }
        >
          {t('yhteisvalinnan-hallinta.valintalaskenta-haulle')}
        </OphButton>
        <OphButton
          disabled={state.hasTag('started')}
          variant="contained"
          onClick={() =>
            startLaskentaWithParams({
              haku,
              haunAsetukset,
              hakukohteet: null,
            })
          }
        >
          {t('yhteisvalinnan-hallinta.kaikki-laskennat-haulle')}
        </OphButton>
      </Stack>
      <ValintalaskentaResult
        actorRef={actorRef}
        hakukohteet={hakukohteet}
        progressType="bar"
      />
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
