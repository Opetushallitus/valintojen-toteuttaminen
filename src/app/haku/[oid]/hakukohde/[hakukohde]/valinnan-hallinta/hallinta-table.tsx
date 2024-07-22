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
import { Haku, Hakukohde } from '@/app/lib/kouta-types';
import HallintaTableRow from './hallinta-table-row';
import { HaunAsetukset } from '@/app/lib/ohjausparametrit';
import { Button, Typography } from '@opetushallitus/oph-design-system';
import { sijoitellaankoHaunHakukohteetLaskennanYhteydessa } from '@/app/lib/kouta';
import Confirm from './confirm';
import theme from '@/app/theme';
import { getLasketutValinnanVaiheet } from '@/app/lib/valintalaskenta-service';
import ErrorRow from './error-row';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import {
  LaskentaEvents,
  LaskentaStates,
  createLaskentaMachine,
} from './laskenta-state';
import { useMachine } from '@xstate/react';
import { useMemo } from 'react';
import { useToaster } from '@/app/hooks/useToaster';

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
        translateEntity,
      },
      addToast,
    );
  }, [haku, hakukohde, haunAsetukset, translateEntity, addToast]);

  const [state, send] = useMachine(laskentaMachine);

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
            paddingRight: theme.spacing(2),
            maxWidth: '400px',
            alignSelf: 'flex-end',
            display: 'flex',
            flexDirection: 'column',
            rowGap: theme.spacing(1),
          }}
        >
          {!state.matches(LaskentaStates.WAITING_CONFIRMATION) && (
            <Button
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
            </Button>
          )}
          {state.matches(LaskentaStates.WAITING_CONFIRMATION) && (
            <Confirm cancel={cancel} confirm={confirm} />
          )}
          {state.matches(LaskentaStates.PROCESSING) && (
            <CircularProgress aria-label={t('valinnanhallinta.lasketaan')} />
          )}
          {containsValisijoittelu && (
            <Typography>
              {t('valinnanhallinta.onvalisijoittelusuoritakaikki')}
            </Typography>
          )}
          {state.context.laskenta.calculatedTime && (
            <Typography>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(
                  state.context.laskenta.calculatedTime,
                ),
              })}
            </Typography>
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
