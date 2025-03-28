'use client';

import { Box, CircularProgress, TableCell, TableRow } from '@mui/material';
import { useTranslations } from '@/lib/localization/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import Confirm from './confirm';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import {
  LaskentaState,
  useLaskentaError,
  useLaskentaState,
} from '@/lib/state/laskenta-state';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import { Valinnanvaihe } from '@/lib/valintaperusteet/valintaperusteet-types';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { ErrorRow } from './error-row';
import { checkCanStartLaskentaForValinnanvaihe } from '@/lib/valintaperusteet/valintaperusteet-utils';

type HallintaTableRowParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
  vaihe: Valinnanvaihe;
  index: number;
  areAllLaskentaRunning: boolean;
  lastCalculated?: number | null;
};

export const HallintaTableRow = ({
  haku,
  hakukohde,
  haunAsetukset,
  vaihe,
  index,
  areAllLaskentaRunning,
  lastCalculated,
}: HallintaTableRowParams) => {
  const { t } = useTranslations();

  const {
    actorRef,
    state,
    startLaskentaWithParams,
    cancelLaskenta,
    confirmLaskenta,
  } = useLaskentaState();

  const laskentaError = useLaskentaError(actorRef);

  const start = () => {
    startLaskentaWithParams({
      haku,
      haunAsetukset,
      hakukohteet: hakukohde,
      vaihe,
      valinnanvaiheNumber: index,
    });
  };

  const canStartLaskenta = checkCanStartLaskentaForValinnanvaihe(vaihe);

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
          {canStartLaskenta && !state.hasTag('waiting-confirmation') && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                rowGap: 1,
              }}
            >
              <OphButton
                variant="outlined"
                disabled={
                  !state.matches(LaskentaState.IDLE) || areAllLaskentaRunning
                }
                onClick={() => start()}
              >
                {t('valinnanhallinta.kaynnista')}
              </OphButton>
              {state.matches(LaskentaState.PROCESSING) && (
                <CircularProgress
                  aria-label={t('valinnanhallinta.lasketaan')}
                />
              )}
            </Box>
          )}
          {canStartLaskenta && state.hasTag('waiting-confirmation') && (
            <Confirm cancel={cancelLaskenta} confirm={confirmLaskenta} />
          )}
          {!canStartLaskenta && !vaihe.valisijoittelu && (
            <Box>{t('valinnanhallinta.eilaskennassa')}</Box>
          )}
          {vaihe.valisijoittelu && (
            <Box>{t('valinnanhallinta.onvalisijoittelu')}</Box>
          )}
          {(state.context.calculatedTime || lastCalculated) && (
            <Box>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(
                  state.context.calculatedTime ?? lastCalculated ?? 0,
                ),
              })}
            </Box>
          )}
        </TableCell>
      </TableRow>
      {laskentaError && <ErrorRow errorMessage={laskentaError} />}
    </>
  );
};
