import { Box } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { TRANSITION_DURATION } from '@/lib/constants';

const PROGRESSBAR_HEIGHT = '42px';

export const ProgressBar = ({ value }: { value: number }) => {
  const valuePercent = `${Math.round(value)}%`;
  const widthPercent = `${value}%`;
  return (
    <Box
      role="progressbar"
      aria-valuenow={value}
      aria-valuetext={valuePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      sx={{
        position: 'relative',
        display: 'block',
        height: PROGRESSBAR_HEIGHT,
        border: `1px solid ${ophColors.grey300}`,
        maxWidth: '700px',
        width: '100%',
        borderRadius: '2px',
        '&:before, &:after': {
          position: 'absolute',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          content: `"${valuePercent}"`,
          height: '100%',
          lineHeight: PROGRESSBAR_HEIGHT,
          textIndent: (theme) => theme.spacing(2),
          userSelect: 'none',
        },
        '&:before': {
          backgroundColor: ophColors.white,
          color: ophColors.grey900,
          width: '100%',
        },
        '&:after': {
          backgroundColor: ophColors.cyan1,
          color: ophColors.white,
          width: widthPercent,
          transition: `${TRANSITION_DURATION} width linear`,
        },
      }}
    />
  );
};
