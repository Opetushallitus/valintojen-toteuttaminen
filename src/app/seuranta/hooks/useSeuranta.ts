'use client';
import { useMemo } from 'react';
import { useQueryState } from 'nuqs';
import { DEFAULT_NUQS_OPTIONS } from '@/lib/constants';

import { useSuspenseQuery } from '@tanstack/react-query';
import { getLaskennanSeurantaTiedotKaikille } from '@/lib/valintalaskenta/valintalaskenta-service';
import { groupBy, isDefined, prop, unique } from 'remeda';
import { getUsersDetails } from '@/lib/oppijanumerorekisteri/onr-service';

const REFETCH_INTERVAL_MS = 10000;

export const useSeurantaParams = () => {
  const [laskennanTila, setLaskennanTila] = useQueryState(
    'tila',
    DEFAULT_NUQS_OPTIONS,
  );

  return {
    laskennanTila,
    setLaskennanTila,
  };
};

export const useSeurantaResults = () => {
  const { laskennanTila } = useSeurantaParams();

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

  const results = useMemo(() => {
    return seurantatiedot.filter(
      (st) => !laskennanTila || st.tila === laskennanTila,
    );
  }, [seurantatiedot, laskennanTila]);

  const usersMap = groupBy(usersDetails, prop('oidHenkilo'));

  return {
    results,
    usersMap,
    totalResults: seurantatiedot,
  };
};
