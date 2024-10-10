'use client';

import { Stack } from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon,
} from '@mui/icons-material';
import HakukohdeList from './hakukohde-list';
import { useState } from 'react';
import { ophColors, styled } from '@/app/lib/theme';
import { useTranslations } from '@/app/hooks/useTranslations';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { ClientSpinner } from '@/app/components/client-spinner';
import HakukohdeSearch from './hakukohde-search';
import { OphButton } from '@opetushallitus/oph-design-system';

const StyledPanel = styled('aside')({
  width: '16vw',
  minWidth: '300px',
  display: 'block',
  height: '100vh',
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

export const HakukohdePanel = ({ hakuOid }: { hakuOid: string }) => {
  const [minimized, setMinimized] = useState(false);
  const { t } = useTranslations();

  return (
    <StyledPanel className={minimized ? 'minimized' : ''}>
      {minimized ? (
        <ExpandButton
          onClick={() => setMinimized(false)}
          aria-label={t('haku.suurenna')}
          startIcon={<KeyboardDoubleArrowRightIcon />}
        >
          <span>{t('yleinen.haku')}</span>
        </ExpandButton>
      ) : (
        <QuerySuspenseBoundary suspenseFallback={<ClientSpinner />}>
          <Stack
            sx={{
              height: '100%',
              flexShrink: 0,
              gap: 1,
              alignItems: 'flex-start',
            }}
          >
            <OphButton
              sx={{ alignSelf: 'flex-end' }}
              onClick={() => setMinimized(true)}
              aria-label={t('haku.pienenna')}
              startIcon={<CloseIcon />}
            />

            <HakukohdeSearch />
            <HakukohdeList hakuOid={hakuOid} />
          </Stack>
        </QuerySuspenseBoundary>
      )}
    </StyledPanel>
  );
};

export default HakukohdePanel;
