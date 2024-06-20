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

type HallintaTableRowParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  vaihe: Valinnanvaihe;
  index: number;
  haunAsetukset: HaunAsetukset;
  areAllCalculationsRunning: boolean;
};

const HallintaTableRow = ({
  hakukohde,
  haku,
  vaihe,
  index,
  haunAsetukset,
  areAllCalculationsRunning,
}: HallintaTableRowParams) => {
  const [isCalculationRunning, setCalculationRunning] = useState(false);
  const [runningCalculation, setRunningCalculation] =
    useState<CalculationStart | null>(null);

  const { t } = useTranslations();

  const start = async (valinnanvaiheNumber: number, vaihe: Valinnanvaihe) => {
    setCalculationRunning(true);
    const started = await kaynnistaLaskenta(
      haku,
      hakukohde,
      vaihe.tyyppi,
      sijoitellaankoHaunHakukohteetLaskennanYhteydessa(haku, haunAsetukset),
      valinnanvaiheNumber,
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
              disabled={isCalculationRunning || areAllCalculationsRunning}
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
