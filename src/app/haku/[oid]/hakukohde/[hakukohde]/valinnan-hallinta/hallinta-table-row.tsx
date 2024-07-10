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
import { useMachine } from '@xstate/react';
import {
  LaskentaEvents,
  LaskentaStates,
  createLaskentaMachine,
} from './laskenta-state';
import { useMemo } from 'react';
import { Haku, Hakukohde } from '@/app/lib/kouta-types';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/app/lib/kouta';
import { HaunAsetukset } from '@/app/lib/ohjausparametrit';

type HallintaTableRowParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
  vaihe: Valinnanvaihe;
  index: number;
  areAllCalculationsRunning: boolean;
  lastCalculated: number | undefined;
};

const HallintaTableRow = ({
  haku,
  hakukohde,
  haunAsetukset,
  vaihe,
  index,
  areAllCalculationsRunning,
  lastCalculated,
}: HallintaTableRowParams) => {
  const { t, translateEntity } = useTranslations();

  const laskentaMachine = useMemo(
    () =>
      createLaskentaMachine({
        haku,
        hakukohde,
        sijoitellaanko: sijoitellaankoHaunHakukohteetLaskennanYhteydessa(
          haku,
          haunAsetukset,
        ),
        valinnanvaiheTyyppi: vaihe.tyyppi,
        valinnanvaiheNumber: index,
        translateEntity,
      }),
    [haku, hakukohde, haunAsetukset, translateEntity, index, vaihe.tyyppi],
  );

  const [state, send] = useMachine(laskentaMachine);

  const start = () => {
    send({ type: LaskentaEvents.START_CALCULATION });
  };

  const cancelConfirmation = () => {
    send({ type: LaskentaEvents.CANCEL });
  };

  const confirm = async () => {
    send({ type: LaskentaEvents.CONFIRM });
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
            !state.matches(LaskentaStates.WAITING_CONFIRMATION) && (
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
                    !state.matches(LaskentaStates.IDLE) ||
                    areAllCalculationsRunning
                  }
                  onClick={() => start()}
                >
                  {t('valinnanhallinta.kaynnista')}
                </Button>
                {state.matches(LaskentaStates.PROCESSING) && (
                  <CircularProgress
                    aria-label={t('valinnanhallinta.lasketaan')}
                  />
                )}
              </Box>
            )}
          {isCalculationUsedForValinnanvaihe(vaihe) &&
            state.matches(LaskentaStates.WAITING_CONFIRMATION) && (
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
                  state.context.calculation.calculatedTime ??
                    lastCalculated ??
                    0,
                ),
              })}
            </Box>
          )}
        </TableCell>
      </TableRow>
      {(state.context.calculation.errorMessage != null ||
        state.context.error) && (
        <ErrorRow
          errorMessage={
            state.context.calculation.errorMessage ?? state.context.error ?? ''
          }
        />
      )}
    </>
  );
};

export default HallintaTableRow;
