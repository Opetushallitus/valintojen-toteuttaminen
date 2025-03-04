'use client';

import { isLaskentaUsedForValinnanvaihe } from '@/app/lib/valintaperusteet/valintaperusteet-service';
import { Box, CircularProgress, TableCell, TableRow } from '@mui/material';
import { useTranslations } from '@/app/lib/localization/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import Confirm from './confirm';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import {
  LaskentaEventType,
  LaskentaState,
  useLaskentaState,
} from '@/app/lib/state/laskenta-state';
import { Haku, Hakukohde } from '@/app/lib/kouta/kouta-types';
import { useToaster } from '@/app/hooks/useToaster';
import { Valinnanvaihe } from '@/app/lib/valintaperusteet/valintaperusteet-types';
import { HaunAsetukset } from '@/app/lib/ohjausparametrit/ohjausparametrit-types';
import { ErrorRow } from './error-row';

type HallintaTableRowParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
  vaihe: Valinnanvaihe;
  index: number;
  areAllLaskentaRunning: boolean;
  lastCalculated?: number | null;
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
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const [state, send] = useLaskentaState({
    haku,
    haunAsetukset,
    hakukohteet: hakukohde,
    vaihe,
    addToast,
    valinnanvaiheNumber: index,
  });

  const start = () => {
    send({ type: LaskentaEventType.START });
  };

  const cancelConfirmation = () => {
    send({ type: LaskentaEventType.CANCEL });
  };

  const confirm = async () => {
    send({ type: LaskentaEventType.CONFIRM });
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
            !state.matches(LaskentaState.WAITING_CONFIRMATION) && (
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
          {isLaskentaUsedForValinnanvaihe(vaihe) &&
            state.matches(LaskentaState.WAITING_CONFIRMATION) && (
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
