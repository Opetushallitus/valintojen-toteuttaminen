'use client';
import { AccordionBox } from '@/components/accordion-box';
import { AccordionBoxTitle } from '@/components/accordion-box-title';
import { FullClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { buildLinkToHaku } from '@/lib/ataru/ataru-service';
import { useHaku } from '@/lib/kouta/useHaku';
import { useTranslations } from '@/lib/localization/useTranslations';

import { Stack } from '@mui/material';
import { OphLink } from '@opetushallitus/oph-design-system';
import { use } from 'react';
import { YhteisvalinnanValintalaskenta } from './components/yhteisvalinnan-valintalaskenta';
import { SijoitteluContainer } from './components/sijoittelu-container';
import { LettersContainer } from './components/letters-container';
import { useConfiguration } from '@/hooks/useConfiguration';

const YhteisvalinnanHallintaContent = ({ hakuOid }: { hakuOid: string }) => {
  const { data: haku } = useHaku({ hakuOid });

  const { configuration, getConfigUrl } = useConfiguration();

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
              {configuration && (
                <OphLink
                  href={getConfigUrl(
                    configuration?.routes.hakukohderyhmapalvelu
                      .haunAsetuksetLinkUrl,
                    { hakuOid: haku.oid },
                  )}
                >
                  {t('yleinen.haun-asetukset')}
                </OphLink>
              )}
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
          <YhteisvalinnanValintalaskenta haku={haku} />
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
        <SijoitteluContainer hakuOid={hakuOid} />
        <LettersContainer hakuOid={hakuOid} />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
