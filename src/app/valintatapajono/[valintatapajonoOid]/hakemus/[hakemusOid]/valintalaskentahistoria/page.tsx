import { FullClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { useRequiredParams } from '@/hooks/useRequiredParams';
import { queryOptionsGetHakijat } from '@/lib/ataru/ataru-queries';
import {
  buildLinkToApplication,
  buildLinkToHaku,
} from '@/lib/ataru/ataru-service';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useHaku } from '@/lib/kouta/useHaku';
import { queryOptionsGetValintalaskentahistoria } from '@/lib/valintalaskenta/valintalaskenta-queries';
import { ValintalaskentahistoriaArvo } from '@/lib/types/laskenta-types';
import { ListTable } from '@/components/table/list-table';
import { makeGenericColumn } from '@/components/table/table-columns';
import { Box, GlobalStyles, keyframes, Stack, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { isObject } from '@/lib/common';

type AvainRow = { avain: string; arvo: string };

const AVAIN_COLUMNS = [
  makeGenericColumn<AvainRow>({
    title: 'valintalaskentahistoria.avain',
    key: 'avain',
    valueProp: 'avain',
    style: { fontWeight: 600 },
  }),
  makeGenericColumn<AvainRow>({
    title: 'valintalaskentahistoria.arvo',
    key: 'arvo',
    valueProp: 'arvo',
  }),
];

const FADE_SIZE = '24px';

// Häivytyksen koot rekisteröidään pituuksiksi, jotta niitä voi animoida.
const SCROLL_FADE_PROPERTIES = `
  @property --fade-top { syntax: '<length>'; inherits: false; initial-value: 0px; }
  @property --fade-bottom { syntax: '<length>'; inherits: false; initial-value: 0px; }
`;

const fadeTop = keyframes`
  from { --fade-top: 0px; }
  to { --fade-top: ${FADE_SIZE}; }
`;

const fadeBottom = keyframes`
  from { --fade-bottom: ${FADE_SIZE}; }
  to { --fade-bottom: 0px; }
`;

// Ylä- ja alareunan häivytys vierityksen mukaan (CSS scroll-driven animations).
// Reunaa ei häivytetä, kun ollaan vierityksen alussa/lopussa tai sisältö ei vieri.
// Selaimissa, jotka eivät tue ominaisuutta, häivytystä ei näytetä.
const scrollFadeSx = {
  maskImage: `linear-gradient(to bottom, transparent 0, black var(--fade-top), black calc(100% - var(--fade-bottom)), transparent 100%)`,
  // Ilman tukea animaatiot ajettaisiin tavallisina 0s-animaatioina, jolloin ne jäisivät lopputilaan
  '@supports (animation-timeline: scroll())': {
    animation: `${fadeTop} linear both, ${fadeBottom} linear both`,
    animationTimeline: 'scroll(self), scroll(self)',
    animationRange: `0 ${FADE_SIZE}, calc(100% - ${FADE_SIZE}) 100%`,
  },
};

const HistorianAvaimet = ({
  avaimet = {},
}: {
  avaimet?: Record<string, ValintalaskentahistoriaArvo>;
}) => {
  const { t } = useTranslations();
  const [avaimetVisible, setAvaimetVisible] = useState(false);

  const rows = Object.entries(avaimet).map(([avain, arvo]) => ({
    avain,
    arvo: isObject(arvo) ? JSON.stringify(arvo, null, 2) : String(arvo ?? ''),
  }));

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <OphButton
        variant="outlined"
        aria-expanded={avaimetVisible}
        onClick={() => setAvaimetVisible((visible) => !visible)}
      >
        {t(
          avaimetVisible
            ? 'valintalaskentahistoria.piilota-avaimet'
            : 'valintalaskentahistoria.nayta-avaimet',
        )}
      </OphButton>
      {avaimetVisible && (
        <Box
          sx={{
            maxHeight: '600px',
            overflowY: 'auto',
            width: '100%',
            // Häivytetään ylä- ja alareuna, jotta vieritettävyys erottuu
            ...scrollFadeSx,
          }}
        >
          <GlobalStyles styles={SCROLL_FADE_PROPERTIES} />
          <ListTable
            rowKeyProp="avain"
            columns={AVAIN_COLUMNS}
            rows={rows}
            sx={{
              // Otsikkorivi piilotetaan visuaalisesti, mutta jätetään ruudunlukijoille
              '& .MuiTableHead-root': {
                position: 'absolute',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
                whiteSpace: 'nowrap',
              },
              '& .MuiTableBody-root .MuiTableCell-root': {
                height: 'auto',
              },
            }}
          />
        </Box>
      )}
    </Stack>
  );
};

const HakuInfo = ({ hakuOid }: { hakuOid: string }) => {
  const { t, translateEntity } = useTranslations();
  const { data: haku } = useHaku({ hakuOid });

  return (
    <Stack direction="row" spacing="4vw" sx={{ paddingTop: 1 }}>
      <LabeledInfoItem
        label={t('yleinen.haku')}
        value={
          <ExternalLink
            name={translateEntity(haku.nimi)}
            href={buildLinkToHaku(hakuOid)}
            noIcon={true}
          />
        }
      />
      <LabeledInfoItem label={t('yleinen.haun-tunniste')} value={haku.oid} />
    </Stack>
  );
};

const ValintalaskentahistoriaContent = ({
  valintatapajonoOid,
  hakemusOid,
}: {
  valintatapajonoOid: string;
  hakemusOid: string;
}) => {
  const { t } = useTranslations();
  const { data: hakijat } = useSuspenseQuery(
    queryOptionsGetHakijat({
      hakemusOids: [hakemusOid],
    }),
  );
  const { data: historiat } = useSuspenseQuery(
    queryOptionsGetValintalaskentahistoria({ valintatapajonoOid, hakemusOid }),
  );
  // TODO: Näytetään toistaiseksi ensimmäisen järjestyskriteerin historia
  const historia = historiat[0];

  const hakija = hakijat?.[0];
  const hakuOid = hakija?.hakuOid;

  return (
    hakija && (
      <>
        <Typography variant="h2">
          {t('valintalaskentahistoria.historia-otsikko')}{' '}
          <ExternalLink
            name={hakemusOid}
            href={buildLinkToApplication(hakemusOid)}
            noIcon={true}
          />{' '}
          ({hakija.hakijanNimi})
        </Typography>
        {hakuOid && <HakuInfo hakuOid={hakija.hakuOid} />}
        {historia && <HistorianAvaimet avaimet={historia.avaimet} />}
      </>
    )
  );
};

export default function ValintalaskentahistoriaPage() {
  const { valintatapajonoOid, hakemusOid } = useRequiredParams<{
    valintatapajonoOid: string;
    hakemusOid: string;
  }>();

  return (
    <Stack spacing={2}>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <ValintalaskentahistoriaContent
          valintatapajonoOid={valintatapajonoOid}
          hakemusOid={hakemusOid}
        />
      </QuerySuspenseBoundary>
    </Stack>
  );
}
