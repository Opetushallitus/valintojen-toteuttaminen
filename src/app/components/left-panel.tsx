'use client';

import { Stack } from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon,
} from '@mui/icons-material';
import React from 'react';
import { ophColors, styled } from '@/app/lib/theme';
import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';

const MINIMIZED_PANEL_WIDTH = '60px';

const StyledPanel = styled('aside')({
  width: '30vw',
  minWidth: '350px',
  display: 'block',
  height: '100vh',
  borderRight: DEFAULT_BOX_BORDER,
  top: 0,
  position: 'sticky',
  '&.minimized': {
    minWidth: MINIMIZED_PANEL_WIDTH,
    width: 'auto',
  },
});

const ExpandButton = styled(OphButton)(({ theme }) => ({
  minWidth: '100%',
  width: '100%',
  position: 'relative',
  fontWeight: 'normal',
  height: '100%',
  color: ophColors.blue2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  border: 0,
  borderRadius: 0,
  '& .MuiButton-icon': {
    margin: 0,
  },
  '&:hover': {
    backgroundColor: ophColors.lightBlue2,
  },
}));

export const LeftPanel = ({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const { t } = useTranslations();

  return (
    <StyledPanel className={isOpen ? '' : 'minimized'}>
      {isOpen ? (
        <Stack
          spacing={1}
          sx={{
            height: '100%',
            flexShrink: 0,
            alignItems: 'stretch',
            paddingLeft: 2,
          }}
        >
          <OphButton
            sx={{ alignSelf: 'flex-end' }}
            onClick={() => setIsOpen(false)}
            aria-label={t('haku.pienenna')}
            startIcon={<CloseIcon />}
          />
          {children}
        </Stack>
      ) : (
        <ExpandButton
          onClick={() => setIsOpen(true)}
          aria-label={t('haku.suurenna')}
          startIcon={<KeyboardDoubleArrowRightIcon />}
        >
          <span>{t('yleinen.haku')}</span>
        </ExpandButton>
      )}
    </StyledPanel>
  );
};
