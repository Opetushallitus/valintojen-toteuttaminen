'use client';

import {
  getValinnanvaiheet,
  isCalculationUsedForValinnanvaihe,
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
import CalculationConfirm from './calculation-confirm';
import theme from '@/app/theme';
import { getLasketutValinnanVaiheet } from '@/app/lib/valintalaskenta-service';
import ErrorRow from './error-row';
import { toFormattedDateTimeString } from '@/app/lib/localization/translation-utils';
import { createLaskentaMachine } from './laskenta-state';
import { useMachine } from '@xstate/react';
import { AnyStateMachine } from 'xstate';

type HallintaTableParams = {
  haku: Haku;
  hakukohde: Hakukohde;
  haunAsetukset: HaunAsetukset;
  laskentaActor?: AnyStateMachine;
};

export const HallintaTableContainer = ({
  hakukohde,
  haku,
  haunAsetukset,
}: HallintaTableParams) => {
  const { translateEntity } = useTranslations();

  /*const existingLaskentaActor = useSelector(laskentaManagerActor, (snapshot) => snapshot.context.actors.find((actor) => actor.id === hakukohde.oid));
    if (existingLaskentaActor) {
      return (<HallintaTable
        hakukohde={hakukohde}
        haku={haku}
        haunAsetukset={haunAsetukset}
        laskentaActor={useActorRef(existingLaskentaActor)}
      />)
    } else {*/
  //const laskentaActor = createLaskentaActor({haku, hakukohde, sijoitellaanko: sijoitellaankoHaunHakukohteetLaskennanYhteydessa(haku, haunAsetukset)});
  //laskentaManagerActor.send({ type: 'ADD_CALCULATION', value: {actor: laskentaActor}});
  return (
    <HallintaTable
      hakukohde={hakukohde}
      haku={haku}
      haunAsetukset={haunAsetukset}
      laskentaActor={createLaskentaMachine({
        haku,
        hakukohde,
        sijoitellaanko: sijoitellaankoHaunHakukohteetLaskennanYhteydessa(
          haku,
          haunAsetukset,
        ),
        translateEntity,
      })}
    />
  );
  //}
};

const HallintaTable = ({
  hakukohde,
  haku,
  haunAsetukset,
  laskentaActor,
}: HallintaTableParams) => {
  const [state, send] = useMachine(laskentaActor);

  const { t, translateEntity } = useTranslations();

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

  //const calculation = useSelector(laskentaActor, (snapshot) => snapshot.context.calculation)

  const startAllCalculations = async () => {
    send({ type: 'CONFIRM' });
  };

  const start = () => {
    send({ type: 'START_CALCULATION' });
  };

  const cancelConfirmation = () => {
    send({ type: 'CANCEL' });
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
                vaihe={vaihe}
                lastCalculated={
                  lasketutValinnanvaiheetQuery.data?.find(
                    (a) => a.valinnanvaiheoid === vaihe.oid,
                  )?.createdAt
                }
                areAllCalculationsRunning={state.matches('PROCESSING')}
                laskentaActor={createLaskentaMachine({
                  haku,
                  hakukohde,
                  sijoitellaanko:
                    sijoitellaankoHaunHakukohteetLaskennanYhteydessa(
                      haku,
                      haunAsetukset,
                    ),
                  valinnanvaiheTyyppi: vaihe.tyyppi,
                  valinnanvaiheNumber: index,
                  translateEntity,
                })}
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
          {!state.matches('WAITING_CONFIRMATION') && (
            <Button
              variant="contained"
              onClick={start}
              disabled={
                !state.matches('IDLE') ||
                !valinnanvaiheetQuery.data.some((vaihe) =>
                  isCalculationUsedForValinnanvaihe(vaihe),
                ) ||
                containsValisijoittelu
              }
            >
              {t('valinnanhallinta.kaynnistakaikki')}
            </Button>
          )}
          {state.matches('WAITING_CONFIRMATION') && (
            <CalculationConfirm
              cancel={cancelConfirmation}
              confirm={startAllCalculations}
            />
          )}
          {state.matches('PROCESSING') && (
            <CircularProgress aria-label={t('yleinen.ladataan')} />
          )}
          {containsValisijoittelu && (
            <Typography>
              {t('valinnanhallinta.onvalisijoittelusuoritakaikki')}
            </Typography>
          )}
          {state.context.calculation.calculatedTime && (
            <Typography>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(
                  state.context.calculation.calculatedTime,
                ),
              })}
            </Typography>
          )}
        </Box>
        {state.context.calculation.errorMessage != null && (
          <Table>
            <ErrorRow errorMessage={state.context.calculation.errorMessage} />
          </Table>
        )}
      </Box>
    );
  }
};

//export default HallintaTable;
