'use client';

import {
  Valinnanvaihe,
  isCalculationUsedForValinnanvaihe,
} from '@/app/lib/valintaperusteet';
import { Box, CircularProgress, TableCell, TableRow } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Button } from '@opetushallitus/oph-design-system';
import { Haku, Hakukohde } from '@/app/lib/kouta-types';
import {
  CalculationStart,
  kaynnistaLaskenta,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { useState } from 'react';
import { HaunAsetukset } from '@/app/lib/ohjausparametrit';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/app/lib/kouta';
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

const CalculationProgress = ({
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

type HallintaTableRowParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  vaihe: Valinnanvaihe;
  index: number;
  haunAsetukset: HaunAsetukset;
};

const HallintaTableRow = ({
  hakukohde,
  haku,
  vaihe,
  index,
  haunAsetukset,
}: HallintaTableRowParams) => {
  const [isCalculationRunning, setCalculationRunning] = useState(false);
  const [runningCalculation, setRunningCalculation] =
    useState<CalculationStart | null>(null);

  const { t } = useTranslations();

  const start = async (valinnanvaiheNumber: number, vaihe: Valinnanvaihe) => {
    setCalculationRunning(true);
    const started = await kaynnistaLaskenta(
      valinnanvaiheNumber,
      haku,
      hakukohde,
      vaihe.tyyppi,
      sijoitellaankoHaunHakukohteetLaskennanYhteydessa(haku, haunAsetukset),
    );
    if (started.startedNewCalculation) {
      setRunningCalculation(started);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Box sx={{ fontWeight: 600 }}>{vaihe.nimi}</Box>
        {vaihe.jonot.map((jono) => (
          <Box key={'vtj-' + jono.oid}>{jono.nimi}</Box>
        ))}
      </TableCell>
      <TableCell>
        <br />
        {vaihe.jonot.map((jono) => (
          <Box key={'vtj-aktiivinen-' + jono.oid}>
            {jono.eiLasketaPaivamaaranJalkeen
              ? t('valinnanhallinta.eilasketajalkeen', {
                  pvm: jono.eiLasketaPaivamaaranJalkeen,
                })
              : t('valinnanhallinta.mukanalaskennassa')}
          </Box>
        ))}
      </TableCell>
      <TableCell sx={{ verticalAlign: 'top' }}>{t(vaihe.tyyppi)}</TableCell>
      <TableCell>
        {isCalculationUsedForValinnanvaihe(vaihe) && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Button
              variant="outlined"
              disabled={isCalculationRunning}
              onClick={() => start(index, vaihe)}
            >
              {t('valinnanhallinta.kaynnista')}
            </Button>
            {runningCalculation && (
              <CalculationProgress
                calculationStart={runningCalculation}
                setCalculationFinished={() => setCalculationRunning(false)}
              />
            )}
          </Box>
        )}
        {!isCalculationUsedForValinnanvaihe(vaihe) && (
          <Box>{t('valinnanhallinta.eilaskennassa')}</Box>
        )}
      </TableCell>
    </TableRow>
  );
};

export default HallintaTableRow;
