'use client';

import { hakukohteenValinnanvaiheetQueryOptions } from '@/lib/valintaperusteet/valintaperusteet-service';
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
import Confirm from './confirm';
import { toFormattedDateTimeString } from '@/lib/localization/translation-utils';
import {
  LaskentaState,
  useLaskentaError,
  useLaskentaState,
} from '@/lib/state/laskenta-state';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { HaunAsetukset } from '@/lib/ohjausparametrit/ohjausparametrit-types';
import { ErrorRow } from './error-row';
import { hakukohteenValintalaskennanTuloksetQueryOptions } from '@/lib/valintalaskenta/valintalaskenta-service';
import { checkCanStartLaskentaForValinnanvaihe } from '@/lib/valintaperusteet/valintaperusteet-utils';
import { NoResults } from '@/components/no-results';
import { HallintaTableRow } from './hallinta-table-row';

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

  const {
    actorRef,
    state,
    startLaskentaWithParams,
    confirmLaskenta,
    cancelLaskenta,
  } = useLaskentaState();

  const laskentaError = useLaskentaError(actorRef);

  const [valinnanvaiheetQuery, lasketutValinnanvaiheetQuery] =
    useSuspenseQueries({
      queries: [
        hakukohteenValinnanvaiheetQueryOptions(hakukohde.oid),
        hakukohteenValintalaskennanTuloksetQueryOptions(hakukohde.oid),
      ],
    });

  const start = () => {
    startLaskentaWithParams({
      haku,
      haunAsetukset,
      hakukohteet: [hakukohde],
    });
  };

  if (valinnanvaiheetQuery.data.length === 0) {
    return <NoResults text={t('valinnanhallinta.eiolemallinnettu')} />;
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
          {!state.hasTag('waiting-confirmation') && (
            <OphButton
              variant="contained"
              onClick={start}
              disabled={
                !state.matches(LaskentaState.IDLE) ||
                !valinnanvaiheetQuery.data.some((vaihe) =>
                  checkCanStartLaskentaForValinnanvaihe(vaihe),
                ) ||
                containsValisijoittelu
              }
            >
              {t('valinnanhallinta.kaynnistakaikki')}
            </OphButton>
          )}
          {state.hasTag('waiting-confirmation') && (
            <Confirm cancel={cancelLaskenta} confirm={confirmLaskenta} />
          )}
          {state.matches(LaskentaState.PROCESSING) && (
            <CircularProgress aria-label={t('valinnanhallinta.lasketaan')} />
          )}
          {containsValisijoittelu && (
            <OphTypography>
              {t('valinnanhallinta.onvalisijoittelusuoritakaikki')}
            </OphTypography>
          )}
          {state.context.calculatedTime && (
            <OphTypography>
              {t('valinnanhallinta.laskettuviimeksi', {
                pvm: toFormattedDateTimeString(state.context.calculatedTime),
              })}
            </OphTypography>
          )}
        </Box>
        {laskentaError && (
          <Table>
            <TableBody>
              <ErrorRow errorMessage={laskentaError} />
            </TableBody>
          </Table>
        )}
      </Box>
    );
  }
};

export default HallintaTable;
