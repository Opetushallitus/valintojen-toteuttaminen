'use client';

import {
  getValinnanvaiheet,
  isLaskentaUsedForValinnanvaihe,
} from '@/lib/valintaperusteet/valintaperusteet-service';
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
import { useTranslations } from '@/lib/localization/useTranslations';
import { Haku, Hakukohde } from '@/lib/kouta/kouta-types';
import HallintaTableRow from './hallinta-table-row';
import Confirm from './confirm';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import {
  LaskentaEventType,
  LaskentaState,
  useLaskentaState,
} from '@/lib/state/laskenta-state';
import { useToaster } from '@/hooks/useToaster';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { ErrorRow } from './error-row';
import { hakukohteenValintalaskennanTuloksetQueryOptions } from '@/lib/valintalaskenta/valintalaskenta-service';

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
        hakukohteenValintalaskennanTuloksetQueryOptions(hakukohde.oid),
      ],
    });

  const confirm = async () => {
    send({ type: LaskentaEventType.CONFIRM });
  };

  const start = () => {
    send({ type: LaskentaEventType.START });
  };

  const cancel = () => {
    send({ type: LaskentaEventType.CANCEL });
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
                areAllLaskentaRunning={state.matches(LaskentaState.PROCESSING)}
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
          {!state.matches(LaskentaState.WAITING_CONFIRMATION) && (
            <OphButton
              variant="contained"
              onClick={start}
              disabled={
                !state.matches(LaskentaState.IDLE) ||
                !valinnanvaiheetQuery.data.some((vaihe) =>
                  isLaskentaUsedForValinnanvaihe(vaihe),
                ) ||
                containsValisijoittelu
              }
            >
              {t('valinnanhallinta.kaynnistakaikki')}
            </OphButton>
          )}
          {state.matches(LaskentaState.WAITING_CONFIRMATION) && (
            <Confirm cancel={cancel} confirm={confirm} />
          )}
          {state.matches(LaskentaState.PROCESSING) && (
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
