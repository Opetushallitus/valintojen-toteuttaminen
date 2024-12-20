'use client';

import {
  getValinnanvaiheet,
  isLaskentaUsedForValinnanvaihe,
} from '@/app/lib/valintaperusteet';
import { useSuspenseQueries } from '@tanstack/react-query';
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Box,
  CircularProgress,
} from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import HallintaTableRow from './hallinta-table-row';
import Confirm from './confirm';
import { getHakukohteenLasketutValinnanvaiheet } from '@/app/lib/valintalaskenta-service';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import {
  LaskentaEvents,
  LaskentaStates,
  useLaskentaState,
} from '@/app/lib/state/laskenta-state';
import { useToaster } from '@/app/hooks/useToaster';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { HaunAsetukset } from '@/app/lib/types/haun-asetukset';
import { ErrorRow } from './error-row';

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
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const [state, send] = useLaskentaState({
    haku,
    haunAsetukset,
    hakukohteet: hakukohde,
    addToast,
  });

  const [valinnanvaiheetQuery, lasketutValinnanvaiheetQuery] =
    useSuspenseQueries({
      queries: [
        {
          queryKey: ['getValinnanvaiheet', hakukohde.oid],
          queryFn: () => getValinnanvaiheet(hakukohde.oid),
        },
        {
          queryKey: ['getLasketutValinnanvaiheet', hakukohde.oid],
          queryFn: () => getHakukohteenLasketutValinnanvaiheet(hakukohde.oid),
        },
      ],
    });

  const confirm = async () => {
    send({ type: LaskentaEvents.CONFIRM });
  };

  const start = () => {
    send({ type: LaskentaEvents.START });
  };

  const cancel = () => {
    send({ type: LaskentaEvents.CANCEL });
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
          rowGap: 2,
          marginBottom: 2,
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
                haku={haku}
                hakukohde={hakukohde}
                haunAsetukset={haunAsetukset}
                vaihe={vaihe}
                index={index}
                lastCalculated={
                  lasketutValinnanvaiheetQuery.data?.find(
                    (a) => a.valinnanvaiheoid === vaihe.oid,
                  )?.createdAt
                }
                areAllLaskentaRunning={state.matches(LaskentaStates.PROCESSING)}
              />
            ))}
          </TableBody>
        </Table>
        <Box
          sx={{
            textAlign: 'right',
            paddingRight: 2,
            maxWidth: '400px',
            alignSelf: 'flex-end',
            display: 'flex',
            flexDirection: 'column',
            rowGap: 2,
          }}
        >
          {!state.matches(LaskentaStates.WAITING_CONFIRMATION) && (
            <OphButton
              variant="contained"
              onClick={start}
              disabled={
                !state.matches(LaskentaStates.IDLE) ||
                !valinnanvaiheetQuery.data.some((vaihe) =>
                  isLaskentaUsedForValinnanvaihe(vaihe),
                ) ||
                containsValisijoittelu
              }
            >
              {t('valinnanhallinta.kaynnistakaikki')}
            </OphButton>
          )}
          {state.matches(LaskentaStates.WAITING_CONFIRMATION) && (
            <Confirm cancel={cancel} confirm={confirm} />
          )}
          {state.matches(LaskentaStates.PROCESSING) && (
            <CircularProgress aria-label={t('valinnanhallinta.lasketaan')} />
          )}
          {containsValisijoittelu && (
            <OphTypography>
              {t('valinnanhallinta.onvalisijoittelusuoritakaikki')}
            </OphTypography>
          )}
          {state.context.laskenta.calculatedTime && (
            <OphTypography>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(
                  state.context.laskenta.calculatedTime,
                ),
              })}
            </OphTypography>
          )}
        </Box>
        {(state.context.laskenta.errorMessage != null ||
          state.context.error) && (
          <Table>
            <TableBody>
              <ErrorRow
                errorMessage={
                  state.context.laskenta.errorMessage ??
                  '' + state.context.error
                }
              />
            </TableBody>
          </Table>
        )}
      </Box>
    );
  }
};

export default HallintaTable;
