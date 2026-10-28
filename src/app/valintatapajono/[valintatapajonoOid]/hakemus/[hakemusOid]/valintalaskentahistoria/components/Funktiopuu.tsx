import { useTranslations } from '@/lib/localization/useTranslations';
import { Valintalaskentahistoria } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';
import { ophColors } from '@/lib/theme';
import { InfoTooltipButton } from '@/components/info-tooltip-button';
import {
  formatArvo,
  NIMETYT_ARVOFUNKTIOT,
  TOOLTIP_MAX_WIDTH,
} from '../lib/valintalaskentahistoriaUtils';
import { NDASH } from '@/lib/constants';

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
          {nimi != null && ` ${NDASH} ${solmu.funktio}`}
          {solmu.tulos != null &&
            ` (${t('valintalaskentahistoria.tulos')}: ${formatArvo(solmu.tulos)})`}
        </span>
        {/* Vanhassa käyttöliittymässä solmun avaimet näytettiin modaalissa. Yksi avain mahtuu
            yhdelle riville, joten se näytetään suoraan rivillä eikä tooltipin takana. */}
        {ainoaAvain && (
          <Box component="span" sx={{ color: ophColors.grey700 }}>
            {` ${NDASH} `}
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
export const Funktiopuu = ({
  historia,
}: {
  historia: Valintalaskentahistoria;
}) => {
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
