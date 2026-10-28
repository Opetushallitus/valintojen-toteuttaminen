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
import { byLocaleCompare } from '@/lib/localization/translation-utils';
import { useHaku } from '@/lib/kouta/useHaku';
import {
  queryOptionsGetHakemuksenValintalaskennanTulokset,
  queryOptionsGetValintalaskentahistoria,
} from '@/lib/valintalaskenta/valintalaskenta-queries';
import {
  queryOptionsGetLaskentakaava,
  queryOptionsGetValintatapajononAktiivisetJarjestyskriteerit,
} from '@/lib/valintaperusteet/valintaperusteet-queries';
import { buildLinkToJarjestyskriteeri } from '@/lib/valintaperusteet/valintaperusteet-service';
import {
  ValintalaskennanTulosValinnanvaiheModel,
  Valintalaskentahistoria,
  ValintalaskentahistoriaTila,
} from '@/lib/types/laskenta-types';
import { ListTable } from '@/components/table/list-table';
import { makeGenericColumn } from '@/components/table/table-columns';
import { ListTableColumn } from '@/components/table/table-types';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { DEFAULT_BOX_BORDER, ophColors, styled } from '@/lib/theme';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { isObject } from '@/lib/common';
import { InfoTooltipButton } from '@/components/info-tooltip-button';
import { NoResults } from '@/components/no-results';
import { DataObjectOutlined, KeyOffOutlined } from '@mui/icons-material';
import { mapKeys } from 'remeda';

type AvainArvoRow = {
  id: string;
  avain: string;
  arvo: string;
  // Vain arvot-taulukossa: järjestysnumero ja nimetyn arvon funktio (Nimetty lukuarvo / Nimetty totuusarvo)
  numero?: number;
  tyyppi?: string;
};

// Sarakkeiden otsikot ovat käännösavaimia. Leveys pitää antaa kaikille paitsi viimeiselle sarakkeelle,
// koska kiinteässä asettelussa otsikon ja rungon sarakkeet ovat yhtä leveät vain annetuilla leveyksillä.
const makeAvainColumn = (title: string, width: string) =>
  makeGenericColumn<AvainArvoRow>({
    title,
    key: 'avain',
    valueProp: 'avain',
    style: { fontWeight: 600, width },
  });

const makeArvoColumn = (title: string, width = 'auto') =>
  makeGenericColumn<AvainArvoRow>({
    title,
    key: 'arvo',
    valueProp: 'arvo',
    style: { width },
  });

const AVAIMET_COLUMNS = [
  makeAvainColumn('valintalaskentahistoria.avain', '50%'),
  makeArvoColumn('valintalaskentahistoria.arvo'),
];

// Arvojen nimet ovat pitkiä, tyypit ja tulokset lyhyitä. Tyypille ja tulokselle annetaan kiinteät
// leveydet, jolloin nimi-sarake (auto) saa kiinteässä asettelussa kaiken jäljelle jäävän tilan.
const ARVOT_COLUMNS = [
  makeGenericColumn<AvainArvoRow>({
    title: 'valintalaskentahistoria.numero',
    key: 'numero',
    valueProp: 'numero',
    style: { width: '60px' },
  }),
  makeAvainColumn('valintalaskentahistoria.nimi', 'auto'),
  makeGenericColumn<AvainArvoRow>({
    title: 'valintalaskentahistoria.tyyppi',
    key: 'tyyppi',
    valueProp: 'tyyppi',
    style: { width: '180px' },
  }),
  makeArvoColumn('valintalaskentahistoria.tulos', '100px'),
];

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

// Valitaan näytettävä tila samoin kuin laskenta (palautettavaTila valintaperusteet-laskennassa):
// ensimmäinen virhe, muuten ensimmäinen hylkäys, muuten hyväksyttävissä.
// Tilat eivät ole aikajärjestyksessä, vaan ne on kerätty alifunktioiden tuloksista.
const palautettavaTila = (
  tilat: Array<ValintalaskentahistoriaTila>,
): ValintalaskentahistoriaTila =>
  tilat.find((tila) => tila.tilatyyppi === 'VIRHE') ??
  tilat.find((tila) => tila.tilatyyppi === 'HYLATTY') ?? {
    tilatyyppi: 'HYVAKSYTTAVISSA',
  };

const JarjestyskriteerinTila = ({
  tilat,
}: {
  tilat: Array<ValintalaskentahistoriaTila>;
}) => {
  const { t, translateEntity } = useTranslations();
  const tila = palautettavaTila(tilat);
  // Kuvauksen kieliavaimet ovat isoilla kirjaimilla (FI, SV, EN)
  const kuvaus = translateEntity(
    mapKeys(tila.kuvaus ?? {}, (kieli) => kieli.toLowerCase()),
  );

  return (
    <span>
      {t(`tuloksenTila.${tila.tilatyyppi}`)}
      {kuvaus && ` – ${kuvaus}`}
    </span>
  );
};

const AvainArvoTable = ({
  rows,
  columns,
  emptyText,
  emptyIcon,
}: {
  rows: Array<AvainArvoRow>;
  columns: Array<ListTableColumn<AvainArvoRow>>;
  emptyText: string;
  emptyIcon: React.ReactNode;
}) =>
  rows.length === 0 ? (
    // Täysleveä kääre, jotta placeholder rivittyy painikerivillä omalle rivilleen
    <Box sx={{ width: '100%' }}>
      <NoResults text={emptyText} icon={emptyIcon} />
    </Box>
  ) : (
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

  const avainRows = Object.entries(avaimet)
    .map(([avain, arvo]) => ({
      id: avain,
      avain,
      arvo: formatArvo(arvo),
    }))
    .sort(byLocaleCompare('avain'));

  const nimetytArvot = historiat.flatMap(collectNimetytArvot);

  const arvoRows = nimetytArvot.map((node, index) => ({
    // Solmuilla ei ole omaa tunnistetta, ja lista lasketaan aina samassa järjestyksessä
    id: String(index),
    numero: index + 1,
    // Funktio on aina "Nimetty lukuarvo"/"Nimetty totuusarvo", varsinainen nimi on avaimissa
    avain: node.avaimet?.nimi ? formatArvo(node.avaimet.nimi) : node.funktio,
    tyyppi: node.funktio,
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
        <AvainArvoTable
          rows={avainRows}
          columns={AVAIMET_COLUMNS}
          emptyText={t('valintalaskentahistoria.ei-avaimia')}
          emptyIcon={<KeyOffOutlined />}
        />
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
        <AvainArvoTable
          rows={arvoRows}
          columns={ARVOT_COLUMNS}
          emptyText={t('valintalaskentahistoria.ei-arvoja')}
          emptyIcon={<DataObjectOutlined />}
        />
      )}
    </Stack>
  );
};

// Välilehdet tyylitellään samoin kuin hakukohteen välilehdet (HakukohdeTabs):
// sininen teksti, aktiivisella ja hover-tilassa alleviivaus, ja välilehtirivin alla vaakaviiva.
const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 'auto',
  borderBottom: DEFAULT_BOX_BORDER,
  '& .MuiTabs-list': {
    columnGap: theme.spacing(2),
  },
  // Alleviivaus tehdään välilehden reunaviivalla kuten hakukohteen välilehdissä
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTab-root': {
    ...theme.typography.body1,
    color: ophColors.blue2,
    textTransform: 'none',
    minWidth: 0,
    minHeight: 'auto',
    padding: theme.spacing(1, 0, 0),
    borderBottom: '3px solid transparent',
    '&:hover, &.Mui-selected': {
      color: ophColors.blue2,
      borderColor: ophColors.blue2,
    },
    '&.Mui-focusVisible': {
      outline: `2px solid ${ophColors.blue2}`,
      outlineOffset: '3px',
    },
  },
}));

// Lihavoitu tekstinpätkä, joka perii ympäröivän tekstin typografian (esim. tooltipissa)
const SemiboldSpan = ({ children }: { children: React.ReactNode }) => (
  <Typography component="span" variant="inherit" sx={{ fontWeight: 600 }}>
    {children}
  </Typography>
);

const FUNKTIOPUU_SOLMU_CLASS = 'funktiopuu-solmu';
const FUNKTIOPUU_RIVI_CLASS = 'funktiopuu-rivi';
// Rivin vasen sisennys (theme spacing -yksiköinä). Puu siirretään saman verran vasemmalle,
// jotta rivien teksti on otsikon kanssa samassa linjassa.
const FUNKTIOPUU_RIVIN_SISENNYS = 0.5;

// Funktiopuun rivin pystysuuntainen täyte (rivien väli on kaksinkertainen). Väli tehdään rivin
// täytteenä eikä gapeilla, jotta rivien välissä hiiri on aina jonkin solmun päällä eikä korostus
// hyppää yläsolmuun. Täyte on rivillä eikä li:llä, jottei sisäkkäisten ryhmien välit kasaannu.
const FUNKTIOPUU_RIVIN_TAYTE = 0.5;

// Avainlistat ja kuvaukset ovat pidempiä kuin tooltipin oletusleveyteen (300px) mahtuu
const TOOLTIP_MAX_WIDTH = '800px';

// Puuttuva arvo näytetään tekstinä eikä viivana, jottei se sekoitu rivin erotinviivaan
const AvaimenArvo = ({ arvo }: { arvo: unknown }) => {
  const { t } = useTranslations();
  return arvo == null ? (
    <em>{t('valintalaskentahistoria.ei-arvoa')}</em>
  ) : (
    formatArvo(arvo)
  );
};

// Ikonin levyinen tila rivin alussa, jotta kaikkien solmujen tekstit alkavat samasta kohdasta
const FUNKTIO_IKONI_LEVEYS = '22px';

// Pieni "f()"-ikoni funktiosolmun rivin alkuun
const FunktioIkoni = () => (
  <Box
    component="span"
    aria-hidden
    sx={{
      display: 'inline-block',
      fontSize: '15px',
      lineHeight: 1.4,
      color: ophColors.cyan1,
      textAlign: 'left',
      width: FUNKTIO_IKONI_LEVEYS,
      flexShrink: 0,
      fontWeight: 600,
    }}
  >
    f()
  </Box>
);

const FunktiopuuSolmu = ({
  solmu,
  syvyys,
}: {
  solmu: Valintalaskentahistoria;
  syvyys: number;
}) => {
  const { t } = useTranslations();
  const onNimettyArvo = NIMETYT_ARVOFUNKTIOT.has(solmu.funktio);
  const alisolmut = solmu.historiat ?? [];

  // Nimetyn arvon nimi on avaimissa, joten sitä ei näytetä uudelleen avainten joukossa
  const { nimi, ...muutAvaimet } = solmu.avaimet ?? {};
  const avaimet = Object.entries(muutAvaimet);
  const ainoaAvain = avaimet.length === 1 ? avaimet[0] : undefined;

  return (
    <Box
      component="li"
      className={FUNKTIOPUU_SOLMU_CLASS}
      sx={{
        // Korostetaan hiiren alla oleva haara (solmu ja sen alisolmut). Hover koskee myös kaikkia
        // ylempiä solmuja, joten korostetaan vain sisin solmu, jonka sisällä ei ole hoveroitua solmua.
        // Luokka rajaa valinnan puun solmuihin, koska tooltipin sisällössäkin on li-elementtejä.
        // Korostuksena otsikkorivillä ja alisolmujen listalla on omat ääriviivansa. Viivat eivät
        // vie tilaa, joten ne eivät siirrä puun sisältöä. Tooltipin lista on otsikkorivin sisällä,
        // joten "& > ul" osuu vain alisolmujen listaan.
        [`&:hover:not(:has(.${FUNKTIOPUU_SOLMU_CLASS}:hover))`]: {
          '& > ul': {
            outline: `1px solid ${ophColors.blue2}`,
          },
          // Korostetun haaran otsikko pysyy näkyvissä, kun haaraa vieritetään. Sticky-elementti
          // pysyy oman li:nsä sisällä, joten otsikko vierii pois haaran loppuessa.
          [`& > .${FUNKTIOPUU_RIVI_CLASS}`]: {
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: ophColors.white,
            // Otsikolla on reunaviiva joka puolella, jotta se erottuu myös silloin, kun haaran
            // yläreuna on vierinyt pois näkyvistä. Viiva tehdään varjolla, koska reunaviiva
            // kasvattaisi rivin kokoa ja siirtäisi puun sisältöä hoverin alkaessa.
            boxShadow: `0 0 0 1px ${ophColors.blue2}`,
          },
        },
        paddingY: FUNKTIOPUU_RIVIN_TAYTE,
        // Ryhmän viimeisen solmun alatäyte jätetään pois, jottei se kasaannu yläsolmujen
        // alatäytteiden kanssa ryhmän loppuun
        '&:last-child': {
          paddingBottom: 0,
        },
      }}
    >
      <Box
        className={FUNKTIOPUU_RIVI_CLASS}
        sx={{
          // Pieni sisennys, jottei rivin sisältö ole kiinni korostuksen reunaviivoissa
          paddingLeft: FUNKTIOPUU_RIVIN_SISENNYS,
          // Rivi on aina asemoitu (relative, hoverissa sticky). Muuten hoverin päättyessä esim.
          // hiiren poistuessa ikkunasta rivin tooltip (disablePortal) asemoituisi ylemmän
          // elementin suhteen ja hyppäisi sivun yläreunaan.
          position: 'relative',
        }}
      >
        {onNimettyArvo ? '' : <FunktioIkoni />}
        <span>
          <SemiboldSpan>
            {nimi == null ? solmu.funktio : formatArvo(nimi)}
          </SemiboldSpan>
          {nimi != null && ` \u2013 ${solmu.funktio}`}
          {solmu.tulos != null &&
            ` (${t('valintalaskentahistoria.tulos')}: ${formatArvo(solmu.tulos)})`}
        </span>
        {/* Vanhassa käyttöliittymässä solmun avaimet näytettiin modaalissa. Yksi avain mahtuu
            yhdelle riville, joten se näytetään suoraan rivillä eikä tooltipin takana. */}
        {ainoaAvain && (
          <Box component="span" sx={{ color: ophColors.grey700 }}>
            {' \u2013 '}
            {ainoaAvain[0]}: <AvaimenArvo arvo={ainoaAvain[1]} />
          </Box>
        )}
        {avaimet.length > 1 && (
          <InfoTooltipButton
            maxWidth={TOOLTIP_MAX_WIDTH}
            title={
              <Box
                component="ul"
                sx={{ listStyle: 'none', margin: 0, padding: 0 }}
              >
                {avaimet.map(([avain, arvo]) => (
                  <Box
                    component="li"
                    key={avain}
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {avain}: <AvaimenArvo arvo={arvo} />
                  </Box>
                ))}
              </Box>
            }
          />
        )}
      </Box>
      {alisolmut.length > 0 && (
        <FunktiopuuLista solmut={alisolmut} syvyys={syvyys + 1} />
      )}
    </Box>
  );
};

const FunktiopuuLista = ({
  solmut,
  syvyys,
}: {
  solmut: Array<Valintalaskentahistoria>;
  syvyys: number;
}) => (
  <Box
    component="ul"
    sx={{
      listStyle: 'none',
      margin: 0,
      // Alitasot sisennetään
      paddingLeft: syvyys === 0 ? 0 : FUNKTIO_IKONI_LEVEYS,
    }}
  >
    {solmut.map((solmu, index) => (
      // Solmuilla ei ole omaa tunnistetta, ja niiden järjestys on kiinteä
      <FunktiopuuSolmu key={index} solmu={solmu} syvyys={syvyys} />
    ))}
  </Box>
);

// Järjestyskriteerin laskennan funktiokutsupuu. Juurisolmu ("Laskenta hakemukselle") ohitetaan,
// koska sen tila ja tulos näytetään jo yllä ja sen avaimet ovat hakemuksen avaimia.
const Funktiopuu = ({ historia }: { historia: Valintalaskentahistoria }) => {
  const solmut = historia.historiat ?? [];

  return (
    solmut.length > 0 && (
      // Siirretään puuta vasemmalle rivien sisennyksen verran, jotta rivien teksti on samassa
      // linjassa otsikon kanssa. Korostuksen reunaviivat jatkuvat sisennyksen verran vasemmalle.
      <Box sx={{ marginLeft: -FUNKTIOPUU_RIVIN_SISENNYS }}>
        <FunktiopuuLista solmut={solmut} syvyys={0} />
      </Box>
    )
  );
};

// Etsitään hakemuksen valintalaskennan tuloksista hakukohde ja valinnanvaihe, joihin valintatapajono kuuluu.
// Valintalaskenta tallentaa valintaperusteiden OIDit sellaisinaan, joten niillä voi linkittää valintaperusteisiin.
const findJononHakukohdeJaValinnanvaihe = (
  tulokset: Record<string, Array<ValintalaskennanTulosValinnanvaiheModel>>,
  valintatapajonoOid: string,
) => {
  for (const [hakukohdeOid, valinnanvaiheet] of Object.entries(tulokset)) {
    const valinnanvaihe = valinnanvaiheet.find((vaihe) =>
      vaihe.valintatapajonot?.some(
        (jono) => jono.valintatapajonooid === valintatapajonoOid,
      ),
    );
    if (valinnanvaihe) {
      return { hakukohdeOid, valinnanvaiheOid: valinnanvaihe.valinnanvaiheoid };
    }
  }
  return undefined;
};

// Välilehti kullekin järjestyskriteerille (historiat ovat prioriteettijärjestyksessä)
const JarjestyskriteeriTabs = ({
  hakuOid,
  hakemusOid,
  valintatapajonoOid,
  historiat,
}: {
  hakuOid: string;
  hakemusOid: string;
  valintatapajonoOid: string;
  historiat: Array<Valintalaskentahistoria>;
}) => {
  const { t } = useTranslations();
  const [valittuIndex, setValittuIndex] = useState(0);
  const historia = historiat[valittuIndex];
  const [{ data: jarjestyskriteerit }, { data: valintalaskennanTulokset }] =
    useSuspenseQueries({
      queries: [
        queryOptionsGetValintatapajononAktiivisetJarjestyskriteerit(
          valintatapajonoOid,
        ),
        queryOptionsGetHakemuksenValintalaskennanTulokset({
          hakuOid,
          hakemusOid,
        }),
      ],
    });
  // Historiat ja aktiiviset järjestyskriteerit ovat samassa prioriteettijärjestyksessä.
  // Huom: linkki vie valintaperusteiden nykyiseen järjestyskriteeriin, joka on voinut muuttua laskennan jälkeen.
  const jarjestyskriteeri = jarjestyskriteerit[valittuIndex];
  const jononSijainti = findJononHakukohdeJaValinnanvaihe(
    valintalaskennanTulokset,
    valintatapajonoOid,
  );
  // Haetaan kaikkien välilehtien laskentakaavat kerralla, jottei välilehden vaihto näytä latausta.
  // Laskennassa järjestyskriteerin nimenä käytetään sen laskentakaavan nimeä.
  const laskentakaavat = useSuspenseQueries({
    queries: jarjestyskriteerit.map((kriteeri) =>
      queryOptionsGetLaskentakaava(kriteeri.laskentakaavaId),
    ),
    combine: (results) => results.map((result) => result.data),
  });
  const laskentakaava = laskentakaavat[valittuIndex];
  const jarjestyskriteerinNimi =
    laskentakaava?.nimi ||
    jarjestyskriteeri?.metatiedot ||
    t('valintalaskentahistoria.jarjestyskriteeri', {
      numero: valittuIndex + 1,
    });

  return (
    <Stack spacing={2}>
      <StyledTabs
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
      </StyledTabs>
      {historia && (
        <Box
          role="tabpanel"
          id={`jarjestyskriteeri-tabpanel-${valittuIndex}`}
          aria-labelledby={`jarjestyskriteeri-tab-${valittuIndex}`}
        >
          <Stack direction="row" spacing="4vw">
            <LabeledInfoItem
              label={t('valintalaskentahistoria.tila')}
              value={<JarjestyskriteerinTila tilat={historia.tilat} />}
            />
            <LabeledInfoItem
              label={t('valintalaskentahistoria.tulos')}
              value={
                historia.tulos == null ? '\u2013' : formatArvo(historia.tulos)
              }
            />
            <LabeledInfoItem
              label={t('valintalaskentahistoria.lisatiedot')}
              value={
                jarjestyskriteeri && jononSijainti ? (
                  <ExternalLink
                    name={t(
                      'valintalaskentahistoria.valintaperusteen-mallinnus',
                    )}
                    href={buildLinkToJarjestyskriteeri({
                      ...jononSijainti,
                      valintatapajonoOid,
                      jarjestyskriteeriOid: jarjestyskriteeri.oid,
                    })}
                  />
                ) : (
                  '–'
                )
              }
            />
          </Stack>
          <Typography
            variant="h4"
            component="h3"
            sx={{ marginTop: 2, marginBottom: 1 }}
          >
            {jarjestyskriteerinNimi}
            {laskentakaava?.kuvaus && (
              <InfoTooltipButton
                title={laskentakaava.kuvaus}
                maxWidth={TOOLTIP_MAX_WIDTH}
              />
            )}
          </Typography>
          {/* key nollaa avattujen ja suljettujen solmujen tilan välilehteä vaihdettaessa */}
          <Funktiopuu key={valittuIndex} historia={historia} />
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
            <JarjestyskriteeriTabs
              hakuOid={hakija.hakuOid}
              hakemusOid={hakemusOid}
              valintatapajonoOid={valintatapajonoOid}
              historiat={historiat}
            />
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
