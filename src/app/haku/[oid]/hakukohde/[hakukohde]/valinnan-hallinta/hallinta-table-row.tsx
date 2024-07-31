'use client';

import { isLaskentaUsedForValinnanvaihe } from '@/app/lib/valintaperusteet';
import { Box, CircularProgress, TableCell, TableRow } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Button } from '@opetushallitus/oph-design-system';
import theme from '@/app/theme';
import Confirm from './confirm';
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
import { useToaster } from '@/app/hooks/useToaster';
import { Valinnanvaihe } from '@/app/lib/valintaperusteet-types';

type HallintaTableRowParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
  vaihe: Valinnanvaihe;
  index: number;
  areAllLaskentaRunning: boolean;
  lastCalculated: number | undefined;
};

const HallintaTableRow = ({
  haku,
  hakukohde,
  haunAsetukset,
  vaihe,
  index,
  areAllLaskentaRunning,
  lastCalculated,
}: HallintaTableRowParams) => {
  const { t, translateEntity } = useTranslations();
  const { addToast } = useToaster();

  const laskentaMachine = useMemo(() => {
    return createLaskentaMachine(
      {
        haku,
        hakukohde,
        sijoitellaanko: sijoitellaankoHaunHakukohteetLaskennanYhteydessa(
          haku,
          haunAsetukset,
        ),
        valinnanvaiheTyyppi: vaihe.tyyppi,
        valinnanvaiheNumber: index,
        valinnanvaiheNimi: vaihe.nimi,
        translateEntity,
      },
      addToast,
    );
  }, [
    haku,
    hakukohde,
    haunAsetukset,
    translateEntity,
    index,
    vaihe.tyyppi,
    addToast,
    vaihe.nimi,
  ]);

  const [state, send] = useMachine(laskentaMachine);

  const start = () => {
    send({ type: LaskentaEvents.START });
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
          {isLaskentaUsedForValinnanvaihe(vaihe) &&
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
                    !state.matches(LaskentaStates.IDLE) || areAllLaskentaRunning
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
          {isLaskentaUsedForValinnanvaihe(vaihe) &&
            state.matches(LaskentaStates.WAITING_CONFIRMATION) && (
              <Confirm cancel={cancelConfirmation} confirm={confirm} />
            )}
          {!isLaskentaUsedForValinnanvaihe(vaihe) && !vaihe.valisijoittelu && (
            <Box>{t('valinnanhallinta.eilaskennassa')}</Box>
          )}
          {vaihe.valisijoittelu && (
            <Box>{t('valinnanhallinta.onvalisijoittelu')}</Box>
          )}
          {(state.context.laskenta.calculatedTime || lastCalculated) && (
            <Box>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(
                  state.context.laskenta.calculatedTime ?? lastCalculated ?? 0,
                ),
              })}
            </Box>
          )}
        </TableCell>
      </TableRow>
      {(state.context.laskenta.errorMessage != null || state.context.error) && (
        <ErrorRow
          errorMessage={
            state.context.laskenta.errorMessage ?? '' + state.context.error
          }
        />
      )}
    </>
  );
};

export default HallintaTableRow;
