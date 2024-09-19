'use client';
import { HakemuksenPistetiedot } from '@/app/lib/types/laskenta-types';
import { ValintakoeAvaimet } from '@/app/lib/types/valintaperusteet-types';
import { NOT_READABLE_REASON_MAP } from '../../lib/pistesyotto-utils';
import { Box, styled, Typography } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

const StyledCell = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  columnGap: '0.6rem',
  minWidth: '220px',
});

export const ReadOnlyKoeCell = ({
  pisteTiedot,
  koe,
}: {
  pisteTiedot: HakemuksenPistetiedot;
  koe: ValintakoeAvaimet;
}) => {
  const { t } = useTranslations();

  const pisteet = pisteTiedot.valintakokeenPisteet.find(
    (vp) => vp.tunniste === koe.tunniste,
  );
  const notReadableReason = pisteet?.osallistuminen
    ? NOT_READABLE_REASON_MAP[pisteet?.osallistuminen]
    : '';

  return (
    <StyledCell>
      <Typography>{pisteet?.arvo}</Typography>
      <Typography>{t(notReadableReason)}</Typography>
    </StyledCell>
  );
};
