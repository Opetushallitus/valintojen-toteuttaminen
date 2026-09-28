import { ophColors } from '@opetushallitus/oph-design-system';
import { styled } from '@/lib/theme';

export const TOOLTIP_BORDER = `1px solid ${ophColors.grey200}`;

export const TooltipStyleWrapper = styled('span')(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    ...theme.typography.body1,
    backgroundColor: ophColors.white,
    cursor: 'auto',
    userSelect: 'all',
    color: ophColors.grey900,
    border: TOOLTIP_BORDER,
    borderRadius: '2px',
    boxShadow: `2px 2px 2px ${ophColors.grey400}55`,
  },
  '& .MuiTooltip-arrow::before': {
    backgroundColor: ophColors.white,
    border: TOOLTIP_BORDER,
  },
}));
