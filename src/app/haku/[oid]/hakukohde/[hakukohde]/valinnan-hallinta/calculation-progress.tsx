'use client';

import { CircularProgress } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { CalculationStart } from '@/app/lib/valintalaskentakoostepalvelu';
import { useQuery } from '@tanstack/react-query';
import {
  SeurantaTiedot,
  getLaskennanSeurantaTiedot,
} from '@/app/lib/valintalaskenta-service';

const POLLING_INTERVAL_SECONDS = 1000 * 10;

const CalculationResult = ({
  seurantaTiedot,
}: {
  calculationStart: CalculationStart;
  seurantaTiedot: SeurantaTiedot;
}) => {
  //TODO Implement in later ticket when it is logical to make the new endpoint for checking error status from koostepalvelu
  /*   const {data: calculationResult} = useSuspenseQuery({
      queryKey: ['calculationResult', calculationStart.loadingUrl],
      queryFn: () => getLaskennanTila(calculationStart.loadingUrl),
    }); */

  return (
    <span>
      Valmistunut: {seurantaTiedot.hakukohteitaKeskeytetty > 0 ? 'FAIL' : 'OK'}
    </span>
  );
};

export const CalculationProgress = ({
  calculationStart,
  setCalculationFinished,
}: {
  calculationStart: CalculationStart;
  setCalculationFinished: () => void;
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
      />
    );
  }
};
