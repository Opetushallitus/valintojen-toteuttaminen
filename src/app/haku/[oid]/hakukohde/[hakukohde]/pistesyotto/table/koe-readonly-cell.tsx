'use client';
import { HakemuksenPistetiedot } from '@/app/lib/types/laskenta-types';
import { Valintakoe } from '@/app/lib/types/valintaperusteet-types';
import { NOT_READABLE_REASON_MAP } from '../pistesyotto-utils';
import { Box, Typography } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

export const ReadOnlyKoeCell = ({
  pisteTiedot,
  koe,
}: {
  pisteTiedot: HakemuksenPistetiedot;
  koe: Valintakoe;
}) => {
  const { t } = useTranslations();

  const pisteet = pisteTiedot.valintakokeenPisteet.find(
    (vp) => vp.tunniste === koe.tunniste,
  );
  const notReadableReason = pisteet?.osallistuminen
    ? NOT_READABLE_REASON_MAP[pisteet?.osallistuminen]
    : '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: '0.6rem',
        minWidth: '220px',
      }}
    >
      <Typography>{pisteet?.arvo}</Typography>
      <Typography>{t(notReadableReason)}</Typography>
    </Box>
  );
};
