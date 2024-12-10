'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ValintakoeOsallistuminenTulos } from '@/app/lib/types/laskenta-types';
import {
  ValintakoeAvaimet,
  ValintakoeInputTyyppi,
} from '@/app/lib/types/valintaperusteet-types';
import { Box, SelectChangeEvent, styled } from '@mui/material';
import { LocalizedSelect } from '@/app/components/localized-select';
import { ChangePisteSyottoFormParams } from './pistesyotto-form';
import { TFunction } from 'i18next';
import { ArvoInput } from './arvo-input';
import {
  PisteSyottoEvent,
  PisteSyottoStates,
  useOsallistumistieto,
} from '../lib/pistesyotto-state';
import { AnyActorRef } from 'xstate';
import { useSelector } from '@xstate/react';

const StyledSelect = styled(LocalizedSelect)({
  minWidth: '150px',
});

export type KoeCellProps = {
  hakemusOid: string;
  koe: ValintakoeAvaimet;
  pistesyottoActorRef: AnyActorRef;
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

export const KoeCellUncontrolled = ({
  hakemusOid,
  koe,
  disabled,
  arvo,
  osallistuminen,
  onChange,
}: Omit<KoeCellProps, 'pistesyottoActorRef'> & {
  arvo: string;
  osallistuminen: ValintakoeOsallistuminenTulos;
  disabled: boolean;
  onChange: (event: ChangePisteSyottoFormParams) => void;
}) => {
  const { t } = useTranslations();

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
            <ArvoInput
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
        <StyledSelect
          id={arvoId}
          value={arvo}
          options={getArvoOptions(koe, t)}
          onChange={(event: SelectChangeEvent<string>) => {
            onChange({
              arvo: event.target.value.toString(),
              hakemusOid,
              koeTunniste: koe.tunniste,
            });
          }}
          disabled={disabled}
          clearable
        />
      )}
      <StyledSelect
        id={`koe-osallistuminen-${hakemusOid}-${koe.tunniste}`}
        value={osallistuminen}
        options={[
          {
            value: ValintakoeOsallistuminenTulos.OSALLISTUI,
            label: t('valintakoe.osallistumisenTila.OSALLISTUI'),
          },
          {
            value: ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
            label: t('valintakoe.osallistumisenTila.EI_OSALLISTUNUT'),
          },
          {
            value: ValintakoeOsallistuminenTulos.MERKITSEMATTA,
            label: t('valintakoe.osallistumisenTila.MERKITSEMATTA'),
          },
          {
            value: ValintakoeOsallistuminenTulos.EI_VAADITA,
            label: t('valintakoe.osallistumisenTila.EI_VAADITA'),
          },
        ]}
        onChange={changeOsallistumisenTila}
        disabled={disabled}
        inputProps={{
          'aria-label': t('pistesyotto.osallistumisen-tila'),
        }}
      />
    </Box>
  );
};

export const KoeCell = ({
  hakemusOid,
  koe,
  pistesyottoActorRef,
}: KoeCellProps) => {
  const state = useSelector(pistesyottoActorRef, (s) => s);

  const disabled = !state.matches(PisteSyottoStates.IDLE);

  const updateForm = (pisteSyottoFormParams: ChangePisteSyottoFormParams) => {
    pistesyottoActorRef.send({
      type: PisteSyottoEvent.ADD_CHANGED_PISTETIETO,
      ...pisteSyottoFormParams,
    });
  };

  const { arvo, osallistuminen } = useOsallistumistieto(pistesyottoActorRef, {
    hakemusOid,
    koeTunniste: koe.tunniste,
  });

  return (
    <KoeCellUncontrolled
      hakemusOid={hakemusOid}
      koe={koe}
      disabled={disabled}
      osallistuminen={osallistuminen}
      onChange={updateForm}
      arvo={arvo}
    />
  );
};
