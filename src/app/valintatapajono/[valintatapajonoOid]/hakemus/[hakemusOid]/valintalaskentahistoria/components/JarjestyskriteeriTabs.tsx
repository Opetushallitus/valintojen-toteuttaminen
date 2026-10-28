import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { InfoTooltipButton } from '@/components/info-tooltip-button';
import { useTranslations } from '@/lib/localization/useTranslations';
import { queryOptionsGetHakemuksenValintalaskennanTulokset } from '@/lib/valintalaskenta/valintalaskenta-queries';
import {
  queryOptionsGetLaskentakaava,
  queryOptionsGetValintatapajononAktiivisetJarjestyskriteerit,
} from '@/lib/valintaperusteet/valintaperusteet-queries';
import { buildLinkToJarjestyskriteeri } from '@/lib/valintaperusteet/valintaperusteet-service';
import { Valintalaskentahistoria } from '@/lib/types/laskenta-types';
import { Box, Stack, Typography } from '@mui/material';
import { DEFAULT_BOX_BORDER, styled } from '@/lib/theme';
import { TAB_ITEM_STYLES, tabRowStyles } from '@/components/tabStyles';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Funktiopuu } from './Funktiopuu';
import { JarjestyskriteerinTila } from './JarjestyskriteerinTila';
import {
  findJononHakukohdeJaValinnanvaihe,
  formatArvo,
  TOOLTIP_MAX_WIDTH,
} from '../lib/valintalaskentahistoriaUtils';
import { NDASH } from '@/lib/constants';

// Välilehdet tyylitellään samoin kuin hakukohteen välilehdet (HakukohdeTabs),
// ja välilehtirivin alla on vaakaviiva.
const StyledTabs = styled('div')(({ theme }) => ({
  ...tabRowStyles(theme),
  borderBottom: DEFAULT_BOX_BORDER,
}));

const StyledTab = styled('button')(({ theme }) => ({
  // Nollataan painikkeen oletustyylit
  ...theme.typography.body1,
  background: 'none',
  border: 'none',
  margin: 0,
  padding: theme.spacing(1, 0, 0),
  cursor: 'pointer',
  ...TAB_ITEM_STYLES,
}));

const tabId = (index: number) => `jarjestyskriteeri-tab-${index}`;
const tabpanelId = (index: number) => `jarjestyskriteeri-tabpanel-${index}`;

// Välilehti kullekin järjestyskriteerille (historiat ovat prioriteettijärjestyksessä)
export const JarjestyskriteeriTabs = ({
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const historia = historiat[valittuIndex];

  // Välilehtien välillä liikutaan nuolinäppäimillä (WAI-ARIA tabs -malli). Valinta seuraa
  // fokusta, koska kaikkien välilehtien tiedot on jo haettu eikä vaihto näytä latausta.
  const valitseJaFokusoi = (index: number) => {
    setValittuIndex(index);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const viimeinen = historiat.length - 1;
    const uusiIndex = {
      ArrowRight: valittuIndex === viimeinen ? 0 : valittuIndex + 1,
      ArrowLeft: valittuIndex === 0 ? viimeinen : valittuIndex - 1,
      Home: 0,
      End: viimeinen,
    }[event.key];
    if (uusiIndex !== undefined) {
      event.preventDefault();
      valitseJaFokusoi(uusiIndex);
    }
  };
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
        role="tablist"
        aria-label={t('valintalaskentahistoria.jarjestyskriteerit')}
        onKeyDown={handleKeyDown}
      >
        {historiat.map((_historia, index) => (
          <StyledTab
            // Historioilla ei ole omaa tunnistetta, ja niiden järjestys on kiinteä
            key={index}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={tabId(index)}
            aria-selected={index === valittuIndex}
            aria-controls={tabpanelId(index)}
            // Vain valittu välilehti on sarkainjärjestyksessä, muihin siirrytään nuolinäppäimillä
            tabIndex={index === valittuIndex ? 0 : -1}
            onClick={() => setValittuIndex(index)}
          >
            {t('valintalaskentahistoria.jarjestyskriteeri', {
              numero: index + 1,
            })}
          </StyledTab>
        ))}
      </StyledTabs>
      {historia && (
        <Box
          role="tabpanel"
          id={tabpanelId(valittuIndex)}
          aria-labelledby={tabId(valittuIndex)}
        >
          <Stack direction="row" spacing="4vw">
            <LabeledInfoItem
              label={t('valintalaskentahistoria.tila')}
              value={<JarjestyskriteerinTila tilat={historia.tilat} />}
            />
            <LabeledInfoItem
              label={t('valintalaskentahistoria.tulos')}
              value={
                historia.tulos == null ? NDASH : formatArvo(historia.tulos)
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
                  NDASH
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
