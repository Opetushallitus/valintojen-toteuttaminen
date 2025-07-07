'use client';

import { TFunction } from '@/lib/localization/useTranslations';
import { ValintakoeOsallistuminenTulos } from '@/lib/types/laskenta-types';
import {
  ValintakoeAvaimet,
  ValintakoeInputTyyppi,
} from '@/lib/valintaperusteet/valintaperusteet-types';
import { Box, SelectChangeEvent } from '@mui/material';
import { LocalizedSelect } from '@/components/localized-select';
import { PisteetInput } from './pisteet-input';
import { PistesyottoChangeParams } from '../lib/state/pistesyotto-state-common';
import { OsallistumisenTilaSelect } from '@/components/osallistumisen-tila-select';
import { memo } from 'react';

const KOE_SELECT_STYLE = {
  minWidth: '150px',
};

type KoeInputsStatelessProps = {
  hakemusOid: string;
  koe: ValintakoeAvaimet;
  naytaVainLaskentaanVaikuttavat?: boolean;
  disabled?: boolean;
};

const getArvoOptions = (koe: ValintakoeAvaimet, t: TFunction) => {
  switch (koe.inputTyyppi) {
    case ValintakoeInputTyyppi.BOOLEAN:
      return [
        { value: 'true', label: t('yleinen.kylla') },
        { value: 'false', label: t('yleinen.ei') },
      ];
    case ValintakoeInputTyyppi.BOOLEAN_ACCEPTED:
      return [
        { value: 'true', label: t('yleinen.hyvaksytty') },
        { value: 'false', label: t('yleinen.hylatty') },
      ];
    default:
      return koe.arvot?.map((a) => ({ value: a, label: a })) ?? [];
  }
};

const ArvoSelect = ({
  id,
  hakemusOid,
  koe,
  disabled,
  arvo,
  onChange,
  t,
}: KoeInputsStatelessProps & {
  id: string;
  arvo: string;
  osallistuminen?: ValintakoeOsallistuminenTulos;
  disabled: boolean;
  onChange: (event: PistesyottoChangeParams) => void;
  t: TFunction;
}) => (
  <LocalizedSelect
    sx={KOE_SELECT_STYLE}
    id={id}
    value={arvo}
    options={getArvoOptions(koe, t)}
    onChange={(event: SelectChangeEvent<string>) => {
      onChange({
        arvo: event.target.value.toString(),
        hakemusOid,
        koeTunniste: koe.tunniste,
      });
    }}
    inputProps={{ 'aria-label': t('pistesyotto.arvo') }}
    disabled={disabled}
    clearable
  />
);

export const KoeInputsStateless = memo(function KoeInputsStateless({
  hakemusOid,
  koe,
  disabled,
  arvo,
  osallistuminen,
  onChange,
  t,
  naytaVainLaskentaanVaikuttavat,
}: KoeInputsStatelessProps & {
  arvo: string;
  osallistuminen?: ValintakoeOsallistuminenTulos;
  disabled: boolean;
  onChange: (event: PistesyottoChangeParams) => void;
  t: TFunction;
}) {
  const arvoId = `koe-arvo-${hakemusOid}-${koe.tunniste}`;

  const changeOsallistumisenTila = (event: SelectChangeEvent<string>) => {
    onChange({
      osallistuminen: event.target.value as ValintakoeOsallistuminenTulos,
      hakemusOid,
      koeTunniste: koe.tunniste,
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: 1,
        minWidth: '220px',
        alignItems: 'flex-start',
      }}
    >
      {koe.inputTyyppi === ValintakoeInputTyyppi.INPUT ? (
        <Box sx={{ width: '80px' }}>
          {osallistuminen !== ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT && (
            <PisteetInput
              min={koe.min}
              max={koe.max}
              disabled={disabled}
              value={arvo}
              onChange={(newArvo: string) => {
                onChange({
                  hakemusOid,
                  koeTunniste: koe.tunniste,
                  arvo: newArvo,
                });
              }}
              arvoId={arvoId}
            />
          )}
        </Box>
      ) : (
        <ArvoSelect
          id={arvoId}
          hakemusOid={hakemusOid}
          koe={koe}
          disabled={disabled}
          arvo={arvo}
          onChange={onChange}
          osallistuminen={osallistuminen}
          t={t}
        />
      )}
      {(!naytaVainLaskentaanVaikuttavat || koe.vaatiiOsallistumisen) && (
        <OsallistumisenTilaSelect
          sx={KOE_SELECT_STYLE}
          id={`koe-osallistuminen-${hakemusOid}-${koe.tunniste}`}
          value={osallistuminen}
          onChange={changeOsallistumisenTila}
          disabled={disabled}
          inputProps={{
            'aria-label': t('pistesyotto.osallistumisen-tila'),
          }}
        />
      )}
    </Box>
  );
});
