import { useTranslations } from '@/lib/localization/useTranslations';
import { Box } from '@mui/material';
import { InfoTooltipButton } from '@/components/info-tooltip-button';
import {
  formatArvo,
  TOOLTIP_MAX_WIDTH,
} from '../lib/valintalaskentahistoriaUtils';

// Puuttuva arvo näytetään tekstinä eikä viivana, jottei se sekoitu rivin erotinviivaan
export const AvaimenArvo = ({ arvo }: { arvo: unknown }) => {
  const { t } = useTranslations();
  return arvo == null ? (
    <em>{t('valintalaskentahistoria.ei-arvoa')}</em>
  ) : (
    formatArvo(arvo)
  );
};

// Lisätietopainike, jonka tooltipissa näytetään avaimet arvoineen
export const AvaimetTooltipButton = ({
  avaimet,
}: {
  avaimet: Array<[string, unknown]>;
}) => (
  <InfoTooltipButton
    maxWidth={TOOLTIP_MAX_WIDTH}
    title={
      <Box component="ul" sx={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {avaimet.map(([avain, arvo]) => (
          <Box component="li" key={avain} sx={{ overflowWrap: 'anywhere' }}>
            {avain}: <AvaimenArvo arvo={arvo} />
          </Box>
        ))}
      </Box>
    }
  />
);
