'use client';

import {
  Valinnanvaihe,
  isCalculationUsedForValinnanvaihe,
} from '@/app/lib/valintaperusteet';
import { Box, TableCell, TableRow } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Button } from '@opetushallitus/oph-design-system';
import { Haku, Hakukohde } from '@/app/lib/kouta-types';
import { kaynnistaLaskenta } from '@/app/lib/valintalaskentakoostepalvelu';
import { useCallback, useReducer } from 'react';
import { HaunAsetukset } from '@/app/lib/ohjausparametrit';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/app/lib/kouta';
import { CalculationProgress } from './calculation-progress';
import theme from '@/app/theme';
import CalculationConfirm from './calculation-confirm';
import {
  CalculationInitializationStatus,
  calculationReducer,
} from './valinnan-hallinta-types';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { FetchError } from '@/app/lib/common';
import ErrorRow from './error-row';

type HallintaTableRowParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  vaihe: Valinnanvaihe;
  index: number;
  haunAsetukset: HaunAsetukset;
  areAllCalculationsRunning: boolean;
  lastCalculated: number | undefined;
};

const HallintaTableRow = ({
  hakukohde,
  haku,
  vaihe,
  index,
  haunAsetukset,
  areAllCalculationsRunning,
  lastCalculated,
}: HallintaTableRowParams) => {
  const { t, translateEntity } = useTranslations();

  const [calculation, dispatchCalculation] = useReducer(calculationReducer, {
    status: CalculationInitializationStatus.NOT_STARTED,
    calculatedTime: lastCalculated,
  });

  const start = () => {
    dispatchCalculation({
      status: CalculationInitializationStatus.WAITING_FOR_CONFIRMATION,
    });
  };

  const cancelConfirmation = () => {
    dispatchCalculation({
      status: CalculationInitializationStatus.NOT_STARTED,
    });
  };

  const confirm = async () => {
    dispatchCalculation({
      status: CalculationInitializationStatus.STARTED,
      errorMessage: null,
    });
    try {
      const started = await kaynnistaLaskenta(
        haku,
        hakukohde,
        vaihe.tyyppi,
        sijoitellaankoHaunHakukohteetLaskennanYhteydessa(haku, haunAsetukset),
        index,
        translateEntity,
      );
      dispatchCalculation({ runningCalculation: started });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof FetchError ? await error.response.text() : '' + error;
      dispatchCalculation({
        errorMessage,
        status: CalculationInitializationStatus.NOT_STARTED,
      });
    }
  };

  const setCompleted = useCallback(
    (time?: Date | number | null, errorMessage?: string | string[]) => {
      dispatchCalculation({
        calculatedTime: time,
        errorMessage,
        status: CalculationInitializationStatus.NOT_STARTED,
      });
    },
    [],
  );

  return (
    <>
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
                    pvm: toFormattedDateTimeString(
                      jono.eiLasketaPaivamaaranJalkeen,
                    ),
                  })
                : t('valinnanhallinta.mukanalaskennassa')}
            </Box>
          ))}
        </TableCell>
        <TableCell sx={{ verticalAlign: 'top' }}>{t(vaihe.tyyppi)}</TableCell>
        <TableCell>
          {isCalculationUsedForValinnanvaihe(vaihe) &&
            calculation.status !==
              CalculationInitializationStatus.WAITING_FOR_CONFIRMATION && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: theme.spacing(1),
                }}
              >
                <Button
                  variant="outlined"
                  disabled={
                    calculation.status ===
                      CalculationInitializationStatus.STARTED ||
                    areAllCalculationsRunning
                  }
                  onClick={() => start()}
                >
                  {t('valinnanhallinta.kaynnista')}
                </Button>
                {calculation.runningCalculation &&
                  calculation.status ===
                    CalculationInitializationStatus.STARTED && (
                    <CalculationProgress
                      key={calculation.runningCalculation.loadingUrl}
                      calculationStart={calculation.runningCalculation}
                      setCompleted={setCompleted}
                    />
                  )}
              </Box>
            )}
          {isCalculationUsedForValinnanvaihe(vaihe) &&
            calculation.status ===
              CalculationInitializationStatus.WAITING_FOR_CONFIRMATION && (
              <CalculationConfirm
                cancel={cancelConfirmation}
                confirm={confirm}
              />
            )}
          {!isCalculationUsedForValinnanvaihe(vaihe) &&
            !vaihe.valisijoittelu && (
              <Box>{t('valinnanhallinta.eilaskennassa')}</Box>
            )}
          {vaihe.valisijoittelu && (
            <Box>{t('valinnanhallinta.onvalisijoittelu')}</Box>
          )}
          {calculation.calculatedTime && (
            <Box>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(calculation.calculatedTime),
              })}
            </Box>
          )}
        </TableCell>
      </TableRow>
      {calculation.errorMessage != null && (
        <ErrorRow errorMessage={calculation.errorMessage} />
      )}
    </>
  );
};

export default HallintaTableRow;
