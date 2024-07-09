'use client';

import {
  Valinnanvaihe,
  isCalculationUsedForValinnanvaihe,
} from '@/app/lib/valintaperusteet';
import { Box, CircularProgress, TableCell, TableRow } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Button } from '@opetushallitus/oph-design-system';
import theme from '@/app/theme';
import CalculationConfirm from './calculation-confirm';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import ErrorRow from './error-row';
import { AnyStateMachine } from 'xstate';
import { useMachine } from '@xstate/react';

type HallintaTableRowParams = {
  vaihe: Valinnanvaihe;
  areAllCalculationsRunning: boolean;
  lastCalculated: number | undefined;
  laskentaActor?: AnyStateMachine;
};

const HallintaTableRow = ({
  vaihe,
  areAllCalculationsRunning,
  lastCalculated,
  laskentaActor,
}: HallintaTableRowParams) => {
  const { t } = useTranslations();

  const [state, send] = useMachine(laskentaActor);

  const start = () => {
    send({ type: 'START_CALCULATION' });
  };

  const cancelConfirmation = () => {
    send({ type: 'CANCEL' });
  };

  const confirm = async () => {
    send({ type: 'CONFIRM' });
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
            !state.matches('WAITING_CONFIRMATION') && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: theme.spacing(1),
                }}
              >
                <Button
                  variant="outlined"
                  disabled={!state.matches('IDLE') || areAllCalculationsRunning}
                  onClick={() => start()}
                >
                  {t('valinnanhallinta.kaynnista')}
                </Button>
                {state.matches('PROCESSING') && (
                  <CircularProgress aria-label={t('yleinen.ladataan')} />
                )}
              </Box>
            )}
          {isCalculationUsedForValinnanvaihe(vaihe) &&
            state.matches('WAITING_CONFIRMATION') && (
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
          {(state.context.calculation.calculatedTime || lastCalculated) && (
            <Box>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(
                  state.context.calculation.calculatedTime ?? lastCalculated,
                ),
              })}
            </Box>
          )}
        </TableCell>
      </TableRow>
      {state.context.calculation.errorMessage != null && (
        <ErrorRow errorMessage={state.context.calculation.errorMessage} />
      )}
    </>
  );
};

export default HallintaTableRow;
