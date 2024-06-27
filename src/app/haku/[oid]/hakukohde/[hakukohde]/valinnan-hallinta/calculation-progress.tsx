'use client';

import { Box, CircularProgress } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  CalculationStart,
  getLaskennanTilaHakukohteelle,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  SeurantaTiedot,
  getLaskennanSeurantaTiedot,
} from '@/app/lib/valintalaskenta-service';

const POLLING_INTERVAL_SECONDS = 1000 * 10;

const CalculationResult = ({
  calculationStart,
  seurantaTiedot,
  setError,
}: {
  calculationStart: CalculationStart;
  seurantaTiedot: SeurantaTiedot;
  setError: (msg: string[]) => void;
}) => {
  const { t } = useTranslations();

  const { data: calculationResult } = useSuspenseQuery({
    queryKey: ['calculationResult', calculationStart.loadingUrl],
    queryFn: () => getLaskennanTilaHakukohteelle(calculationStart.loadingUrl),
  });

  if (seurantaTiedot.hakukohteitaKeskeytetty > 0) {
    setError(calculationResult.notifications);
    return <></>;
  } else {
    return <Box component="p">{t('valinnanhallinta.valmistui')}</Box>;
  }
};

export const CalculationProgress = ({
  calculationStart,
  setCalculationFinished,
  setError,
}: {
  calculationStart: CalculationStart;
  setCalculationFinished: () => void;
  setError: (msg: string[]) => void;
}) => {
  const { t } = useTranslations();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['calculationProgress', calculationStart.loadingUrl],
    queryFn: () => getLaskennanSeurantaTiedot(calculationStart.loadingUrl),
    refetchInterval: (query) => {
      const complete = query.state?.data?.tila === 'VALMIS';
      if (complete) {
        //FIXME: on retry this function seems to fire immediately
        setCalculationFinished();
        return false;
      }
      return POLLING_INTERVAL_SECONDS;
    },
  });

  if (isError) {
    throw error;
  }

  if (isLoading || data?.tila !== 'VALMIS') {
    return <CircularProgress aria-label={t('yleinen.ladataan')} />;
  } else {
    return (
      <CalculationResult
        seurantaTiedot={data}
        calculationStart={calculationStart}
        setError={setError}
      />
    );
  }
};
