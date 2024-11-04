'use client';

import { Stack, useMediaQuery, useTheme } from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { notLarge, ophColors, styled } from '@/app/lib/theme';
import { useTranslations } from '@/app/hooks/useTranslations';
import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { FullClientSpinner } from '@/app/components/client-spinner';
import HenkiloSearch from './henkilo-search';
import { OphButton } from '@opetushallitus/oph-design-system';
import { DEFAULT_BOX_BORDER } from '@/app/lib/constants';
import { useParams } from 'next/navigation';
import HenkiloList from './henkilo-list';

const StyledPanel = styled('aside')({
  width: '16vw',
  minWidth: '300px',
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

export const HenkiloPanel = ({ hakuOid }: { hakuOid: string }) => {
  const theme = useTheme();
  const isNotLarge = useMediaQuery(notLarge(theme));
  const hakukohdeOid = useParams().hakukohde;
  const [minimized, setMinimized] = useState(
    () => Boolean(hakukohdeOid) && isNotLarge,
  );
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
        <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
          <Stack
            sx={{
              height: '100%',
              flexShrink: 0,
              gap: 1,
              alignItems: 'flex-start',
              paddingLeft: 2,
            }}
          >
            <OphButton
              sx={{ alignSelf: 'flex-end' }}
              onClick={() => setMinimized(true)}
              aria-label={t('haku.pienenna')}
              startIcon={<CloseIcon />}
            />

            <HenkiloSearch />
            <HenkiloList hakuOid={hakuOid} />
          </Stack>
        </QuerySuspenseBoundary>
      )}
    </StyledPanel>
  );
};

export default HenkiloPanel;
