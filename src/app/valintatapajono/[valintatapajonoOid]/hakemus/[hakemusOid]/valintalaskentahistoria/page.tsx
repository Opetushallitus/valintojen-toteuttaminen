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
import { Valintalaskentahistoria } from '@/lib/types/laskenta-types';
import { ListTable } from '@/components/table/list-table';
import { makeGenericColumn } from '@/components/table/table-columns';
import { ListTableColumn } from '@/components/table/table-types';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { isObject } from '@/lib/common';

type AvainArvoRow = { id: string; avain: string; arvo: string };

// Sarakkeiden otsikot ovat käännösavaimia. Ensimmäisen sarakkeen leveys pitää antaa, koska
// kiinteässä asettelussa otsikon ja rungon sarakkeet ovat yhtä leveät vain annetuilla leveyksillä.
const makeAvainArvoColumns = ({
  avainTitle,
  arvoTitle,
  avainWidth,
}: {
  avainTitle: string;
  arvoTitle: string;
  avainWidth: string;
}) => [
  makeGenericColumn<AvainArvoRow>({
    title: avainTitle,
    key: 'avain',
    valueProp: 'avain',
    style: { fontWeight: 600, width: avainWidth },
  }),
  makeGenericColumn<AvainArvoRow>({
    title: arvoTitle,
    key: 'arvo',
    valueProp: 'arvo',
  }),
];

const AVAIMET_COLUMNS = makeAvainArvoColumns({
  avainTitle: 'valintalaskentahistoria.avain',
  arvoTitle: 'valintalaskentahistoria.arvo',
  avainWidth: '50%',
});

// Arvojen nimet ovat pitkiä ja tulokset lyhyitä lukuja
const ARVOT_COLUMNS = makeAvainArvoColumns({
  avainTitle: 'valintalaskentahistoria.nimi',
  arvoTitle: 'valintalaskentahistoria.tulos',
  avainWidth: '75%',
});

const formatArvo = (arvo: unknown) =>
  isObject(arvo) ? JSON.stringify(arvo) : String(arvo);

const NIMETYT_ARVOFUNKTIOT = new Set([
  'Nimetty lukuarvo',
  'Nimetty totuusarvo',
]);

// Kerätään funktiopuusta nimettyjen arvojen tulokset
const collectNimetytArvot = (
  historia: Valintalaskentahistoria,
): Array<Valintalaskentahistoria> => [
  ...(NIMETYT_ARVOFUNKTIOT.has(historia.funktio) && historia.tulos != null
    ? [historia]
    : []),
  ...(historia.historiat ?? []).flatMap(collectNimetytArvot),
];

const AvainArvoTable = ({
  rows,
  columns,
}: {
  rows: Array<AvainArvoRow>;
  columns: Array<ListTableColumn<AvainArvoRow>>;
}) => (
  <ListTable
    rowKeyProp="id"
    columns={columns}
    rows={rows}
    sx={{
      // Vain taulukon runkoa vieritetään, joten otsikkorivi pysyy näkyvissä eikä vierityspalkki ulotu sen kohdalle.
      // Rivit ovat omia kiinteän asettelun taulukoitaan, jotta sarakkeet pysyvät kohdakkain otsikon kanssa.
      '& .MuiTableRow-root': {
        display: 'table',
        width: '100%',
        tableLayout: 'fixed',
      },
      '& .MuiTableHead-root': {
        display: 'block',
        // Varataan otsikkoon vierityspalkin levyinen tila, jotta sarakkeet osuvat rungon sarakkeiden kohdalle
        overflow: 'hidden',
        scrollbarGutter: 'stable',
        backgroundColor: ophColors.white,
      },
      '& .MuiTableBody-root': {
        display: 'block',
        maxHeight: '600px',
        overflowY: 'auto',
        scrollbarGutter: 'stable',
      },
      '& .MuiTableBody-root .MuiTableCell-root': {
        height: 'auto',
        // Kiinteässä asettelussa pitkät arvot pitää rivittää, etteivät ne valu viereiseen sarakkeeseen
        overflowWrap: 'anywhere',
      },
    }}
  />
);

const HistorianAvaimetJaArvot = ({
  historiat,
}: {
  historiat: Array<Valintalaskentahistoria>;
}) => {
  const { t } = useTranslations();
  const [avaimetVisible, setAvaimetVisible] = useState(false);
  const [arvotVisible, setArvotVisible] = useState(false);

  const avaimet = Object.assign(
    {},
    ...historiat.map((historia) => historia.avaimet ?? {}),
  ) as Record<string, unknown>;

  const avainRows = Object.entries(avaimet).map(([avain, arvo]) => ({
    id: avain,
    avain,
    arvo: formatArvo(arvo),
  }));

  const nimetytArvot = historiat.flatMap(collectNimetytArvot);

  const arvoRows = nimetytArvot.map((node, index) => ({
    // Solmuilla ei ole omaa tunnistetta, ja lista lasketaan aina samassa järjestyksessä
    id: String(index),
    // Funktio on aina "Nimetty lukuarvo"/"Nimetty totuusarvo", varsinainen nimi on avaimissa
    avain: `${index + 1}. ${node.avaimet?.nimi ? formatArvo(node.avaimet.nimi) : node.funktio}`,
    arvo: formatArvo(node.tulos),
  }));

  return (
    // Painikkeet ovat rinnakkain, ja täysleveä taulukko rivittyy oman painikkeensa perään
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}
    >
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
        <AvainArvoTable rows={avainRows} columns={AVAIMET_COLUMNS} />
      )}
      <OphButton
        variant="outlined"
        aria-expanded={arvotVisible}
        onClick={() => setArvotVisible((visible) => !visible)}
      >
        {t(
          arvotVisible
            ? 'valintalaskentahistoria.piilota-arvot'
            : 'valintalaskentahistoria.nayta-arvot',
        )}
      </OphButton>
      {arvotVisible && (
        <AvainArvoTable rows={arvoRows} columns={ARVOT_COLUMNS} />
      )}
    </Stack>
  );
};

// Välilehti kullekin järjestyskriteerille (historiat ovat prioriteettijärjestyksessä)
const JarjestyskriteeriTabs = ({
  historiat,
}: {
  historiat: Array<Valintalaskentahistoria>;
}) => {
  const { t } = useTranslations();
  const [valittuIndex, setValittuIndex] = useState(0);
  const historia = historiat[valittuIndex];

  return (
    <Stack spacing={2}>
      <Tabs
        value={valittuIndex}
        onChange={(_e, index: number) => setValittuIndex(index)}
        aria-label={t('valintalaskentahistoria.jarjestyskriteerit')}
        variant="scrollable"
        scrollButtons="auto"
      >
        {historiat.map((_historia, index) => (
          <Tab
            // Historioilla ei ole omaa tunnistetta, ja niiden järjestys on kiinteä
            key={index}
            value={index}
            id={`jarjestyskriteeri-tab-${index}`}
            aria-controls={`jarjestyskriteeri-tabpanel-${index}`}
            label={t('valintalaskentahistoria.jarjestyskriteeri', {
              numero: index + 1,
            })}
          />
        ))}
      </Tabs>
      {historia && (
        <Box
          role="tabpanel"
          id={`jarjestyskriteeri-tabpanel-${valittuIndex}`}
          aria-labelledby={`jarjestyskriteeri-tab-${valittuIndex}`}
        >
          {/* TODO: Järjestyskriteerin tila, tulos ja funktiopuu */}
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
        {historiat.length > 0 && (
          <>
            <HistorianAvaimetJaArvot historiat={historiat} />
            <JarjestyskriteeriTabs historiat={historiat} />
          </>
        )}
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
