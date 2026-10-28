import { Box } from '@mui/material';
import { InfoTooltipButton } from '@/components/info-tooltip-button';
import { TOOLTIP_MAX_WIDTH } from '../lib/valintalaskentahistoriaUtils';
import { AvaimenArvo } from './AvaimenArvo';

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
