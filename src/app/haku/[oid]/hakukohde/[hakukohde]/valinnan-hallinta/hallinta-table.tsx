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

  const [isCalculationRunning, setCalculationRunning] = useState(false);
  const [runningCalculation, setRunningCalculation] =
    useState<CalculationStart | null>(null);

  const startAllCalculations = async () => {
    setCalculationRunning(true);
    const started = await kaynnistaLaskentaHakukohteenValinnanvaiheille(
      haku,
      hakukohde,
      sijoitellaankoHaunHakukohteetLaskennanYhteydessa(haku, haunAsetukset),
    );
    if (started.startedNewCalculation) {
      setRunningCalculation(started);
    }
  };

  if (valinnanvaiheet.length === 0) {
    return <Box>{t('valinnanhallinta.tyhja')}</Box>;
  } else {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: '1rem' }}>
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
                areAllCalculationsRunning={isCalculationRunning}
              />
            ))}
          </TableBody>
        </Table>
        <Box sx={{ textAlign: 'right', paddingRight: '1rem' }}>
          <Button
            variant="contained"
            onClick={startAllCalculations}
            disabled={
              isCalculationRunning ||
              !valinnanvaiheet.some((vaihe) =>
                isCalculationUsedForValinnanvaihe(vaihe),
              )
            }
          >
            {t('valinnanhallinta.kaynnistakaikki')}
          </Button>
          {runningCalculation && (
            <CalculationProgress
              calculationStart={runningCalculation}
              setCalculationFinished={() => setCalculationRunning(false)}
            />
          )}
        </Box>
      </Box>
    );
  }
};

export default HallintaTable;
