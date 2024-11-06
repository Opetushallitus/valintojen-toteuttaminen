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

const StyledPanel = styled('aside')({
  width: '17vw',
  minWidth: '400px',
  display: 'block',
  height: '100vh',
  borderRight: DEFAULT_BOX_BORDER,
  top: 0,
  position: 'sticky',
  '&.minimized': {
    minWidth: 0,
    width: 'auto',
  },
});

const ExpandButton = styled(OphButton)(({ theme }) => ({
  fontWeight: 'normal',
  height: '100%',
  color: ophColors.blue2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  border: 0,
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
