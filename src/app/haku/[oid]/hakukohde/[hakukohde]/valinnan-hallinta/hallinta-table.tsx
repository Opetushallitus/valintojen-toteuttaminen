'use client';

import {
  getValinnanvaiheet,
  isCalculationUsedForValinnanvaihe,
} from '@/app/lib/valintaperusteet';
import { useSuspenseQuery } from '@tanstack/react-query';
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
import { Button } from '@opetushallitus/oph-design-system';
import {
  CalculationStart,
  kaynnistaLaskentaHakukohteenValinnanvaiheille,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/app/lib/kouta';
import { useState } from 'react';
import { CalculationProgress } from './calculation-progress';
import { CalculationInitializationStatus } from './valinnan-hallinta-types';
import CalculationConfirm from './calculation-confirm';
import theme from '@/app/theme';

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
  const { data: valinnanvaiheet } = useSuspenseQuery({
    queryKey: ['getValinnanvaiheet', hakukohde.oid],
    queryFn: () => getValinnanvaiheet(hakukohde.oid),
  });

  const { t } = useTranslations();

  const [calculationInitializationStatus, setCalculationInitializationStatus] =
    useState<CalculationInitializationStatus>(
      CalculationInitializationStatus.NOT_STARTED,
    );
  const [runningCalculation, setRunningCalculation] =
    useState<CalculationStart | null>(null);

  const startAllCalculations = async () => {
    setCalculationInitializationStatus(CalculationInitializationStatus.STARTED);
    const started = await kaynnistaLaskentaHakukohteenValinnanvaiheille(
      haku,
      hakukohde,
      sijoitellaankoHaunHakukohteetLaskennanYhteydessa(haku, haunAsetukset),
    );
    if (started.startedNewCalculation) {
      setRunningCalculation(started);
    }
  };

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

  if (valinnanvaiheet.length === 0) {
    return <Box>{t('valinnanhallinta.tyhja')}</Box>;
  } else {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: theme.spacing(2),
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
            {valinnanvaiheet.map((vaihe, index) => (
              <HallintaTableRow
                key={'vv-' + vaihe.oid}
                vaihe={vaihe}
                index={index}
                haku={haku}
                hakukohde={hakukohde}
                haunAsetukset={haunAsetukset}
                areAllCalculationsRunning={
                  calculationInitializationStatus ===
                  CalculationInitializationStatus.STARTED
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
          {calculationInitializationStatus !==
            CalculationInitializationStatus.WAITING_FOR_CONFIRMATION && (
            <Button
              variant="contained"
              onClick={start}
              disabled={
                calculationInitializationStatus ===
                  CalculationInitializationStatus.STARTED ||
                !valinnanvaiheet.some((vaihe) =>
                  isCalculationUsedForValinnanvaihe(vaihe),
                )
              }
            >
              {t('valinnanhallinta.kaynnistakaikki')}
            </Button>
          )}
          {calculationInitializationStatus ===
            CalculationInitializationStatus.WAITING_FOR_CONFIRMATION && (
            <CalculationConfirm
              cancel={cancelConfirmation}
              confirm={startAllCalculations}
            />
          )}
          {runningCalculation && (
            <CalculationProgress
              calculationStart={runningCalculation}
              setCalculationFinished={() =>
                setCalculationInitializationStatus(
                  CalculationInitializationStatus.NOT_STARTED,
                )
              }
            />
          )}
        </Box>
      </Box>
    );
  }
};

export default HallintaTable;
