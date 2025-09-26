'use client';

import { getLaskennanSeurantaTiedotKaikille } from '@/lib/valintalaskenta/valintalaskenta-service';
import { Box } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import SeurantaItem from './seuranta-item';
import { groupBy, isDefined, prop, unique } from 'remeda';
import { getUsersDetails } from '@/lib/oppijanumerorekisteri/onr-service';

const REFETCH_INTERVAL_MS = 10000;

export default function SeurantaContent() {
  const { data: seurantatiedot } = useSuspenseQuery({
    queryKey: ['seuranta-kaikki'],
    queryFn: () => getLaskennanSeurantaTiedotKaikille(),
    refetchInterval: REFETCH_INTERVAL_MS,
  });

  const distinctUsers = unique(
    seurantatiedot.map((st) => st.userOID).filter(isDefined),
  );

  const { data: usersDetails } = useSuspenseQuery({
    queryKey: ['seuranta-kaynnistajat', distinctUsers],
    queryFn: () =>
      distinctUsers.length >= 0 ? getUsersDetails(distinctUsers) : [],
  });

  const usersMap = groupBy(usersDetails, prop('oidHenkilo'));

  return (
    <Box>
      {seurantatiedot.map((st) => (
        <SeurantaItem
          seurantaTiedot={st}
          key={st.uuid}
          personDetails={usersMap[st.userOID]?.[0]}
        />
      ))}
    </Box>
  );
}
