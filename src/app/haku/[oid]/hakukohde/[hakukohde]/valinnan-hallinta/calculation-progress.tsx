'use client';

import { CircularProgress } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  CalculationStart,
  getLaskennanTilaHakukohteelle,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { useQuery } from '@tanstack/react-query';
import { getLaskennanSeurantaTiedot } from '@/app/lib/valintalaskenta-service';

const POLLING_INTERVAL_SECONDS = 1000 * 10;

export const CalculationProgress = ({
  calculationStart,
  setCompleted,
}: {
  calculationStart: CalculationStart;
  setCompleted: (time?: Date | null, errorMessage?: string | string[]) => void;
}) => {
  const { t } = useTranslations();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['calculationProgress', calculationStart.loadingUrl],
    queryFn: () => getLaskennanSeurantaTiedot(calculationStart.loadingUrl),
    refetchInterval: (query) => {
      const complete = query.state?.data?.tila === 'VALMIS';
      if (complete) {
        return false;
      }
      return POLLING_INTERVAL_SECONDS;
    },
  });

  const {
    data: calculationResult,
    isLoading: resultIsLoading,
    isError: resultIsError,
    error: resultError,
  } = useQuery({
    queryKey: ['calculationResult', calculationStart.loadingUrl],
    queryFn: () => getLaskennanTilaHakukohteelle(calculationStart.loadingUrl),
    enabled: data?.tila === 'VALMIS',
  });

  if (isError) {
    setCompleted(null, error.message);
  }

  if (resultIsError) {
    setCompleted(null, resultError.message);
  }

  if (isLoading || data?.tila !== 'VALMIS' || resultIsLoading) {
    return <CircularProgress aria-label={t('yleinen.ladataan')} />;
  } else if (data?.hakukohteitaKeskeytetty > 0 && calculationResult) {
    setCompleted(null, calculationResult.notifications ?? []);
    return <></>;
  } else {
    setCompleted(new Date());
    return <></>;
  }
};
