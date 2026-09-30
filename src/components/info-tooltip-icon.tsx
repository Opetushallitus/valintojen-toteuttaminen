import { Tooltip } from '@mui/material';

import { ophColors } from '@opetushallitus/oph-design-system';
import { InfoOutlined } from '@mui/icons-material';
import { TooltipStyleWrapper as StyleWrapper } from '@/components/tooltip-style-wrapper';
import { Box } from '@mui/system';

type Props = {
  title: string;
  iconColor?: string;
};

export const InfoTooltipIcon = ({
  title,
  iconColor = ophColors.grey800,
}: Props) => (
  <StyleWrapper>
    <Tooltip
      slotProps={{
        popper: {
          disablePortal: true,
        },
      }}
      placement="right"
      arrow
      title={<Box sx={{ padding: 1 }}>{title}</Box>}
    >
      <InfoOutlined
        tabIndex={0}
        titleAccess={typeof title === 'string' ? title : undefined}
        sx={{
          fontSize: 22,
          verticalAlign: 'middle',
          marginLeft: 1,
          ...(iconColor && { color: iconColor }),
        }}
      />
    </Tooltip>
  </StyleWrapper>
);
