'use client';

import { getLaskennanSeurantaTiedotKaikille } from '@/lib/valintalaskenta/valintalaskenta-service';
import { Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import SeurantaItem from './seuranta-item';

const REFETCH_INTERVAL_MS = 10000;

export default function SeurantaContent() {
  const { data: seurantatiedot } = useSuspenseQuery({
    queryKey: ['seuranta-kaikki'],
    queryFn: () => getLaskennanSeurantaTiedotKaikille(),
    refetchInterval: REFETCH_INTERVAL_MS,
  });

  return (
    <Box>
      {seurantatiedot.map((st) => (
        <SeurantaItem seurantaTiedot={st} key={st.uuid} />
      ))}
    </Box>
  );
}
