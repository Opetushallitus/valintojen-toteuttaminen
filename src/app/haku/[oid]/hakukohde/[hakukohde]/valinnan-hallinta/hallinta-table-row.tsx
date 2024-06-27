'use client';

import {
  Valinnanvaihe,
  isCalculationUsedForValinnanvaihe,
} from '@/app/lib/valintaperusteet';
import { Box, TableCell, TableRow } from '@mui/material';
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
import { CalculationProgress } from './calculation-progress';
import theme from '@/app/theme';
import CalculationConfirm from './calculation-confirm';
import { CalculationInitializationStatus } from './valinnan-hallinta-types';
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
  const [calculationInitializationStatus, setCalculationInitializationStatus] =
    useState<CalculationInitializationStatus>(
      CalculationInitializationStatus.NOT_STARTED,
    );

  const [runningCalculation, setRunningCalculation] =
    useState<CalculationStart | null>(null);

  const { t } = useTranslations();

  const [errorMessage, setErrorMessage] = useState<string | string[] | null>();

  const start = () => {
    setCalculationInitializationStatus(
      CalculationInitializationStatus.WAITING_FOR_CONFIRMATION,
    );
  };

  const cancelConfirmation = () => {
    setCalculationInitializationStatus(
      CalculationInitializationStatus.NOT_STARTED,
    );
  };

  const confirm = async () => {
    setCalculationInitializationStatus(CalculationInitializationStatus.STARTED);
    try {
      const started = await kaynnistaLaskenta(
        haku,
        hakukohde,
        vaihe.tyyppi,
        sijoitellaankoHaunHakukohteetLaskennanYhteydessa(haku, haunAsetukset),
        index,
      );
      if (started.startedNewCalculation) {
        setRunningCalculation(started);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof FetchError) {
        setErrorMessage(await error.response.text());
      } else {
        setErrorMessage('' + error);
      }
      setCalculationInitializationStatus(
        CalculationInitializationStatus.NOT_STARTED,
      );
    }
  };

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
            calculationInitializationStatus !==
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
                    calculationInitializationStatus ===
                      CalculationInitializationStatus.STARTED ||
                    areAllCalculationsRunning
                  }
                  onClick={() => start()}
                >
                  {t('valinnanhallinta.kaynnista')}
                </Button>
                {runningCalculation && (
                  <CalculationProgress
                    calculationStart={runningCalculation}
                    setCalculationFinished={() =>
                      setCalculationInitializationStatus(
                        CalculationInitializationStatus.NOT_STARTED,
                      )
                    }
                    setError={setErrorMessage}
                  />
                )}
              </Box>
            )}
          {isCalculationUsedForValinnanvaihe(vaihe) &&
            calculationInitializationStatus ===
              CalculationInitializationStatus.WAITING_FOR_CONFIRMATION && (
              <CalculationConfirm
                cancel={cancelConfirmation}
                confirm={confirm}
              />
            )}
          {!isCalculationUsedForValinnanvaihe(vaihe) && (
            <Box>{t('valinnanhallinta.eilaskennassa')}</Box>
          )}
          {lastCalculated && (
            <Box>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(lastCalculated),
              })}
            </Box>
          )}
        </TableCell>
      </TableRow>
      {errorMessage && <ErrorRow errorMessage={errorMessage} />}
    </>
  );
};

export default HallintaTableRow;
