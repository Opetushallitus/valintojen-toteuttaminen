import { LabeledInfoItem } from '@/components/labeled-info-item';
import { useTranslations } from '@/lib/localization/useTranslations';
import {
  JarjestyskriteeriModel,
  Valintalaskentahistoria,
} from '@/lib/types/laskenta-types';
import { Box, Stack } from '@mui/material';
import { Tab, TabRow } from '@/components/Tabs';
import { useRef, useState } from 'react';
import { Funktiopuu } from './Funktiopuu';
import { JarjestyskriteerinTila } from './JarjestyskriteerinTila';
import {
  ValintaperusteetLink,
  ValintaperusteetLinkInfo,
} from './ValintaperusteetLink';
import { formatArvo, JononSijainti } from '../lib/valintalaskentahistoriaUtils';
import { NDASH } from '@/lib/constants';

const tabId = (index: number) => `jarjestyskriteeri-tab-${index}`;
const tabpanelId = (index: number) => `jarjestyskriteeri-tabpanel-${index}`;

// Välilehti kullekin järjestyskriteerille (historiat ovat prioriteettijärjestyksessä).
// Jonon sijainnilla linkitetään valintaperusteisiin. Jos sitä ei löytynyt, linkkiä ei näytetä.
// Järjestyskriteerien tulokset ovat samassa järjestyksessä kuin historiat.
export const JarjestyskriteeriTabs = ({
  valintatapajonoOid,
  jononSijainti,
  jarjestyskriteerienTulokset,
  historiat,
}: {
  valintatapajonoOid: string;
  jononSijainti?: JononSijainti;
  jarjestyskriteerienTulokset: Array<JarjestyskriteeriModel>;
  historiat: Array<Valintalaskentahistoria>;
}) => {
  const { t } = useTranslations();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const historia = historiat[selectedIndex];
  const tulos = jarjestyskriteerienTulokset[selectedIndex];
  const linkProps = jononSijainti && {
    valintatapajonoOid,
    jononSijainti,
    tulos,
  };

  // Välilehtien välillä liikutaan nuolinäppäimillä (WAI-ARIA tabs -malli). Valinta seuraa
  // fokusta, koska kaikkien välilehtien tiedot on jo haettu eikä vaihto näytä latausta.
  const selectAndFocus = (index: number) => {
    setSelectedIndex(index);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const viimeinen = historiat.length - 1;
    const uusiIndex = {
      ArrowRight: selectedIndex === viimeinen ? 0 : selectedIndex + 1,
      ArrowLeft: selectedIndex === 0 ? viimeinen : selectedIndex - 1,
      Home: 0,
      End: viimeinen,
    }[event.key];
    if (uusiIndex !== undefined) {
      event.preventDefault();
      selectAndFocus(uusiIndex);
    }
  };

  return (
    <Stack spacing={2}>
      <TabRow
        role="tablist"
        sx={{ paddingTop: 1 }}
        aria-label={t('valintalaskentahistoria.jarjestyskriteerit')}
        onKeyDown={handleKeyDown}
      >
        {historiat.map((_historia, index) => (
          <Tab
            // Historioilla ei ole omaa tunnistetta, ja niiden järjestys on kiinteä
            key={index}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={tabId(index)}
            aria-selected={index === selectedIndex}
            aria-controls={tabpanelId(index)}
            // Vain valittu välilehti on sarkainjärjestyksessä, muihin siirrytään nuolinäppäimillä
            tabIndex={index === selectedIndex ? 0 : -1}
            onClick={() => setSelectedIndex(index)}
          >
            {t('valintalaskentahistoria.jarjestyskriteeri', {
              numero: index + 1,
            })}
          </Tab>
        ))}
      </TabRow>
      {historia && (
        <Box
          role="tabpanel"
          id={tabpanelId(selectedIndex)}
          aria-labelledby={tabId(selectedIndex)}
        >
          <Stack direction="row" spacing="4vw">
            <LabeledInfoItem
              label={t('valintalaskentahistoria.tila')}
              value={<JarjestyskriteerinTila tulos={tulos} />}
            />
            <LabeledInfoItem
              label={t('valintalaskentahistoria.tulos')}
              value={
                historia.tulos == null ? NDASH : formatArvo(historia.tulos)
              }
            />
            <LabeledInfoItem
              label={t('valintalaskentahistoria.lisatiedot')}
              labelInfo={
                linkProps && <ValintaperusteetLinkInfo {...linkProps} />
              }
              value={
                linkProps ? <ValintaperusteetLink {...linkProps} /> : NDASH
              }
            />
          </Stack>
          <Funktiopuu historia={historia} />
        </Box>
      )}
    </Stack>
  );
};
