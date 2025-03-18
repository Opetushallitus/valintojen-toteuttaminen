import React, { useState } from 'react';

import { Backdrop, Box, Button, Tooltip } from '@mui/material';

import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { Close as CloseIcon, InfoOutlined } from '@mui/icons-material';
import { styled } from '@/lib/theme';
import { useTranslations } from '@/lib/localization/useTranslations';

type Props = {
  title: React.JSX.Element | string;
};

const TOOLTIP_BORDER = `1px solid ${ophColors.grey200}`;

const StyleWrapper = styled('span')(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    ...theme.typography.body1,
    backgroundColor: ophColors.white,
    cursor: 'auto',
    userSelect: 'all',
    color: ophColors.grey900,
    border: TOOLTIP_BORDER,
    borderRadius: '2px',
    padding: 0,
    boxShadow: `2px 2px 2px ${ophColors.grey400}55`,
  },
  '& .MuiTooltip-arrow::before': {
    backgroundColor: ophColors.white,
    border: TOOLTIP_BORDER,
  },
}));

export const InfoTooltipButton = ({ title }: Props) => {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);

  const handleClose = (e: React.SyntheticEvent<Element, Event> | Event) => {
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <StyleWrapper>
      <Backdrop
        sx={{ backgroundColor: 'transparent', zIndex: 2 }}
        open={open}
        onClick={handleClose}
      />
      <Tooltip
        open={open}
        onClose={handleClose}
        slotProps={{
          popper: {
            disablePortal: true,
          },
        }}
        placement="right"
        disableFocusListener
        disableHoverListener
        disableTouchListener
        arrow
        title={
          <>
            <OphButton
              sx={{ float: 'right', color: ophColors.black }}
              aria-label={t('yleinen.sulje')}
              onClick={handleClose}
              startIcon={<CloseIcon />}
            />
            <Box sx={{ padding: 1 }}>{title}</Box>
          </>
        }
      >
        <Button
          aria-label={t('yleinen.lisatietoja')}
          sx={{
            '&.MuiButton-root': {
              padding: 0,
              margin: 0,
              minWidth: 0,
              flexShrink: 0,
              height: '24px',
              width: '24px',
              marginLeft: 1,
            },
            '& .MuiButton-startIcon': {
              margin: 0,
            },
          }}
          variant="text"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((isOpen) => !isOpen);
          }}
          startIcon={<InfoOutlined />}
          onFocus={(e) => e.stopPropagation()}
        />
      </Tooltip>
    </StyleWrapper>
  );
};
