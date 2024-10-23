'use client';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from '@/app/lib/types/laskenta-types';
import {
  ValintakoeAvaimet,
  ValintakoeInputTyyppi,
} from '@/app/lib/types/valintaperusteet-types';
import { useState } from 'react';
import { Box, SelectChangeEvent, styled } from '@mui/material';
import { LocalizedSelect } from '@/app/components/localized-select';
import { ChangePisteSyottoFormParams } from './pistesyotto-form';
import { TFunction } from 'i18next';
import { ArvoInput } from './arvo-input';

const StyledSelect = styled(LocalizedSelect)({
  minWidth: '150px',
});

export type KoeCellProps = {
  pisteTiedot: HakemuksenPistetiedot;
  updateForm: (params: ChangePisteSyottoFormParams) => void;
  koe: ValintakoeAvaimet;
  disabled: boolean;
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

export const KoeCell = ({
  pisteTiedot,
  updateForm,
  koe,
  disabled,
}: KoeCellProps) => {
  const { t } = useTranslations();

  const findMatchingKoePisteet = (): ValintakokeenPisteet | undefined =>
    pisteTiedot.valintakokeenPisteet.find((k) => k.tunniste === koe.tunniste);

  const [arvo, setArvo] = useState<string>(
    findMatchingKoePisteet()?.arvo ?? '',
  );
  const [osallistuminen, setOsallistuminen] =
    useState<ValintakoeOsallistuminenTulos>(
      findMatchingKoePisteet()?.osallistuminen ??
        ValintakoeOsallistuminenTulos.MERKITSEMATTA,
    );

  const changeSelectArvo = (event: SelectChangeEvent<string>) => {
    setArvo(event.target.value.toString());
    updateForm({
      value: event.target.value.toString(),
      hakemusOid: pisteTiedot.hakemusOid,
      koeTunniste: koe.tunniste,
      updateArvo: true,
    });
  };

  const changeOsallistumisenTila = (event: SelectChangeEvent<string>) => {
    const newOsallistuminen = event.target
      .value as ValintakoeOsallistuminenTulos;
    setOsallistuminen(newOsallistuminen);
    let updateArvo = false;
    if (newOsallistuminen !== ValintakoeOsallistuminenTulos.OSALLISTUI) {
      setArvo('');
      updateArvo = true;
    }
    updateForm({
      value: event.target.value as ValintakoeOsallistuminenTulos,
      hakemusOid: pisteTiedot.hakemusOid,
      koeTunniste: koe.tunniste,
      updateArvo,
    });
  };

  const arvoId = `koe-arvo-${pisteTiedot.hakijaOid}-${koe.tunniste}`;

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
      {koe.inputTyyppi === ValintakoeInputTyyppi.INPUT && (
        <Box sx={{ width: '80px' }}>
          {osallistuminen !== ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT && (
            <ArvoInput
              koe={koe}
              pisteTiedot={pisteTiedot}
              updateForm={updateForm}
              disabled={disabled}
              arvo={arvo}
              onArvoChange={(newArvo: string) => {
                setArvo(newArvo);
                if (
                  newArvo &&
                  osallistuminen === ValintakoeOsallistuminenTulos.MERKITSEMATTA
                ) {
                  setOsallistuminen(ValintakoeOsallistuminenTulos.OSALLISTUI);
                }
              }}
              arvoId={arvoId}
            />
          )}
        </Box>
      )}
      {koe.inputTyyppi !== ValintakoeInputTyyppi.INPUT && (
        <StyledSelect
          id={arvoId}
          value={arvo}
          options={getArvoOptions(koe, t)}
          onChange={changeSelectArvo}
          disabled={disabled}
          clearable
        />
      )}
      <StyledSelect
        id={`koe-osallistuminen-${pisteTiedot.hakijaOid}-${koe.tunniste}`}
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
