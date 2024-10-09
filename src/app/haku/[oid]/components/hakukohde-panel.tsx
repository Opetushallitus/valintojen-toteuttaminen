'use client';

import { styled, IconButton, FormLabel } from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon,
} from '@mui/icons-material';
import HakukohdeList from './hakukohde-list';
import { useState } from 'react';
import { ophColors } from '@/app/lib/theme';
import { useTranslations } from '@/app/hooks/useTranslations';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { ClientSpinner } from '@/app/components/client-spinner';
import HakukohdeSearch from './hakukohde-search';

const StyledPanel = styled('aside')({
  width: '16vw',
  textAlign: 'left',
  minHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  rowGap: '7px',
  paddingRight: '5px',
  alignItems: 'start',
  transition: 'width 300ms ease-in-out',
  ['label, button']: {
    color: ophColors.blue2,
    maxWidth: '50px',
    alignSelf: 'end',
    marginRight: '15px',
    marginBottom: '5px',
  },
  '&.minimized': {
    width: '50px',
    rowGap: '3px',
    ['label, button']: {
      margin: 0,
      alignSelf: 'start',
    },
  },
});

export const HakukohdePanel = ({ hakuOid }: { hakuOid: string }) => {
  const [minimized, setMinimized] = useState(false);
  const { t } = useTranslations();

  return (
    <StyledPanel className={minimized ? 'minimized' : ''}>
      {!minimized && (
        <QuerySuspenseBoundary suspenseFallback={<ClientSpinner />}>
          <IconButton
            sx={{ alignSelf: 'right', width: '1rem', height: '1rem' }}
            onClick={() => setMinimized(true)}
            aria-label={t('haku.pienenna')}
          >
            <CloseIcon />
          </IconButton>
          <HakukohdeSearch />
          <HakukohdeList hakuOid={hakuOid} />
        </QuerySuspenseBoundary>
      )}
      {minimized && (
        <>
          <IconButton
            id="expand-button"
            name="expand-button"
            onClick={() => setMinimized(false)}
            aria-label={t('haku.suurenna')}
          >
            <KeyboardDoubleArrowRightIcon />
          </IconButton>
          <FormLabel htmlFor="expand-button">{t('yleinen.haku')}</FormLabel>
        </>
      )}
    </StyledPanel>
  );
};

export default HakukohdePanel;
