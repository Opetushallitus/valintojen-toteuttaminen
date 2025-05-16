'use client';
import { ValintakokeenPisteet } from '@/lib/types/laskenta-types';
import { Box, Typography } from '@mui/material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { NOT_READABLE_REASON_MAP } from '../lib/pistesyotto-utils';
import { styled } from '@/lib/theme';
import { usePisteSyottoSearchParams } from '../hooks/usePisteSyottoSearch';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';

const StyledCell = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  columnGap: '0.6rem',
  minWidth: '220px',
});

export const ReadOnlyKoeCell = ({
  koe,
  koePisteet,
}: {
  koe: ValintakoeAvaimet;
  koePisteet?: ValintakokeenPisteet;
}) => {
  const { t } = useTranslations();

  const { naytaVainLaskentaanVaikuttavat } = usePisteSyottoSearchParams();

  const notReadableReason = koePisteet?.osallistuminen
    ? NOT_READABLE_REASON_MAP[koePisteet?.osallistuminen]
    : '';

  return (
    <StyledCell>
      <Typography>{koePisteet?.arvo}</Typography>
      {(!naytaVainLaskentaanVaikuttavat || koe.vaatiiOsallistumisen) && (
        <Typography>{t(notReadableReason)}</Typography>
      )}
    </StyledCell>
  );
};
