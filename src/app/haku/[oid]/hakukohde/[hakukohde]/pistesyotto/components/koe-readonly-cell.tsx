'use client';
import { ValintakokeenPisteet } from '@/app/lib/types/laskenta-types';
import { Box, styled, Typography } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { NOT_READABLE_REASON_MAP } from '../lib/pistesyotto-utils';

const StyledCell = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  columnGap: '0.6rem',
  minWidth: '220px',
});

export const ReadOnlyKoeCell = ({
  koePisteet,
}: {
  koePisteet?: ValintakokeenPisteet;
}) => {
  const { t } = useTranslations();

  const notReadableReason = koePisteet?.osallistuminen
    ? NOT_READABLE_REASON_MAP[koePisteet?.osallistuminen]
    : '';

  return (
    <StyledCell>
      <Typography>{koePisteet?.arvo}</Typography>
      <Typography>{t(notReadableReason)}</Typography>
    </StyledCell>
  );
};
