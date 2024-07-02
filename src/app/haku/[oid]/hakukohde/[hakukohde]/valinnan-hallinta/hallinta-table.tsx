'use client';

import {
  getValinnanvaiheet,
  isCalculationUsedForValinnanvaihe,
} from '@/app/lib/valintaperusteet';
import { useSuspenseQueries } from '@tanstack/react-query';
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Box,
} from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Haku, Hakukohde } from '@/app/lib/kouta-types';
import HallintaTableRow from './hallinta-table-row';
import { HaunAsetukset } from '@/app/lib/ohjausparametrit';
import { Button, Typography } from '@opetushallitus/oph-design-system';
import { kaynnistaLaskentaHakukohteenValinnanvaiheille } from '@/app/lib/valintalaskentakoostepalvelu';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/app/lib/kouta';
import { useReducer } from 'react';
import { CalculationProgress } from './calculation-progress';
import {
  CalculationInitializationStatus,
  calculationReducer,
} from './valinnan-hallinta-types';
import CalculationConfirm from './calculation-confirm';
import theme from '@/app/theme';
import { getLasketutValinnanVaiheet } from '@/app/lib/valintalaskenta-service';
import { FetchError } from '@/app/lib/common';
import ErrorRow from './error-row';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';

type HallintaTableParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
};

const HallintaTable = ({
  hakukohde,
  haku,
  haunAsetukset,
}: HallintaTableParams) => {
  const [valinnanvaiheetQuery, lasketutValinnanvaiheetQuery] =
    useSuspenseQueries({
      queries: [
        {
          queryKey: ['getValinnanvaiheet', hakukohde.oid],
          queryFn: () => getValinnanvaiheet(hakukohde.oid),
        },
        {
          queryKey: ['getLasketutValinnanvaiheet', hakukohde.oid],
          queryFn: () => getLasketutValinnanVaiheet(hakukohde.oid),
        },
      ],
    });

  const { t } = useTranslations();

  const [calculation, dispatchCalculation] = useReducer(calculationReducer, {
    status: CalculationInitializationStatus.NOT_STARTED,
    calculatedTime: null,
  });

  const startAllCalculations = async () => {
    dispatchCalculation({
      status: CalculationInitializationStatus.STARTED,
      errorMessage: null,
    });
    try {
      const started = await kaynnistaLaskentaHakukohteenValinnanvaiheille(
        haku,
        hakukohde,
        sijoitellaankoHaunHakukohteetLaskennanYhteydessa(haku, haunAsetukset),
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

  const setCompleted = (
    time?: Date | number | null,
    errorMessage?: string | string[],
  ) => {
    dispatchCalculation({
      calculatedTime: time,
      errorMessage,
      status: CalculationInitializationStatus.NOT_STARTED,
    });
  };

  if (valinnanvaiheetQuery.data.length === 0) {
    return <Box>{t('valinnanhallinta.eiolemallinnettu')}</Box>;
  } else {
    const containsValisijoittelu = valinnanvaiheetQuery.data.some(
      (vv) => vv.valisijoittelu,
    );
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: theme.spacing(2),
          marginBottom: theme.spacing(2),
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('valinnanvaihe.nimi')}</TableCell>
              <TableCell>{t('valinnanhallinta.laskenta')}</TableCell>
              <TableCell>{t('valinnanhallinta.tyyppi')}</TableCell>
              <TableCell>{t('yleinen.toiminnot')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {valinnanvaiheetQuery.data.map((vaihe, index) => (
              <HallintaTableRow
                key={'vv-' + vaihe.oid}
                vaihe={vaihe}
                index={index}
                haku={haku}
                hakukohde={hakukohde}
                haunAsetukset={haunAsetukset}
                lastCalculated={
                  lasketutValinnanvaiheetQuery.data?.find(
                    (a) => a.valinnanvaiheoid === vaihe.oid,
                  )?.createdAt
                }
                areAllCalculationsRunning={
                  calculation.status === CalculationInitializationStatus.STARTED
                }
              />
            ))}
          </TableBody>
        </Table>
        <Box
          sx={{
            textAlign: 'right',
            paddingRight: theme.spacing(2),
            maxWidth: '400px',
            alignSelf: 'flex-end',
            display: 'flex',
            flexDirection: 'column',
            rowGap: theme.spacing(1),
          }}
        >
          {calculation.status !==
            CalculationInitializationStatus.WAITING_FOR_CONFIRMATION && (
            <Button
              variant="contained"
              onClick={start}
              disabled={
                calculation.status ===
                  CalculationInitializationStatus.STARTED ||
                !valinnanvaiheetQuery.data.some((vaihe) =>
                  isCalculationUsedForValinnanvaihe(vaihe),
                ) ||
                containsValisijoittelu
              }
            >
              {t('valinnanhallinta.kaynnistakaikki')}
            </Button>
          )}
          {calculation.status ===
            CalculationInitializationStatus.WAITING_FOR_CONFIRMATION && (
            <CalculationConfirm
              cancel={cancelConfirmation}
              confirm={startAllCalculations}
            />
          )}
          {calculation.runningCalculation && (
            <CalculationProgress
              key={'all-' + calculation.runningCalculation.loadingUrl}
              calculationStart={calculation.runningCalculation}
              setCompleted={setCompleted}
            />
          )}
          {containsValisijoittelu && (
            <Typography>
              {t('valinnanhallinta.onvalisijoittelusuoritakaikki')}
            </Typography>
          )}
          {calculation.calculatedTime && (
            <Typography>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(calculation.calculatedTime),
              })}
            </Typography>
          )}
        </Box>
        {calculation.errorMessage != null && (
          <Table>
            <ErrorRow errorMessage={calculation.errorMessage} />
          </Table>
        )}
      </Box>
    );
  }
};

export default HallintaTable;
