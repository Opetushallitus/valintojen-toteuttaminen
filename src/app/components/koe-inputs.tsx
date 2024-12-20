'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ValintakoeOsallistuminenTulos } from '@/app/lib/types/laskenta-types';
import {
  ValintakoeAvaimet,
  ValintakoeInputTyyppi,
} from '@/app/lib/types/valintaperusteet-types';
import { Box, SelectChangeEvent } from '@mui/material';
import { LocalizedSelect } from '@/app/components/localized-select';
import { TFunction } from 'i18next';
import { PisteetInput } from './pisteet-input';
import {
  PistesyottoActorRef,
  PistesyottoChangeParams,
  usePistesyottoActorRef,
  useKoePistetiedot,
} from '../lib/state/pistesyotto-state';
import { OsallistumisenTilaSelect } from '@/app/components/osallistumisen-tila-select';

const KOE_SELECT_STYLE = {
  minWidth: '150px',
};

export type KoeInputsProps = {
  hakemusOid: string;
  koe: ValintakoeAvaimet;
  pistesyottoActorRef: PistesyottoActorRef;
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
}: Omit<KoeInputsProps, 'pistesyottoActorRef'> & {
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

export const KoeInputsStateless = ({
  hakemusOid,
  koe,
  disabled,
  arvo,
  osallistuminen,
  onChange,
  t,
}: Omit<KoeInputsProps, 'pistesyottoActorRef'> & {
  arvo: string;
  osallistuminen?: ValintakoeOsallistuminenTulos;
  disabled: boolean;
  onChange: (event: PistesyottoChangeParams) => void;
  t: TFunction;
}) => {
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
              koe={koe}
              disabled={disabled}
              arvo={arvo}
              onArvoChange={(newArvo: string) => {
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
    </Box>
  );
};

export const KoeInputs = ({
  hakemusOid,
  koe,
  pistesyottoActorRef,
}: KoeInputsProps) => {
  const { t } = useTranslations();
  const { onKoeChange, isUpdating } =
    usePistesyottoActorRef(pistesyottoActorRef);

  const { arvo, osallistuminen } = useKoePistetiedot(pistesyottoActorRef, {
    hakemusOid,
    koeTunniste: koe.tunniste,
  });

  return (
    <KoeInputsStateless
      hakemusOid={hakemusOid}
      koe={koe}
      disabled={isUpdating}
      osallistuminen={osallistuminen}
      onChange={onKoeChange}
      arvo={arvo}
      t={t}
    />
  );
};
