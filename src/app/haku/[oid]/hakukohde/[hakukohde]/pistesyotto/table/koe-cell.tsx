'use client';
import {
  InputValidator,
  numberValidator,
} from '@/app/components/form/input-validators';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  HakemuksenPistetiedot,
  ValintakoeOsallistuminen,
  ValintakokeenPisteet,
} from '@/app/lib/types/laskenta-types';
import {
  Valintakoe,
  ValintakoeInputTyyppi,
} from '@/app/lib/types/valintaperusteet-types';
import { ChangeEvent, useState } from 'react';
import { Box, debounce, SelectChangeEvent } from '@mui/material';
import { OphSelect } from '@/app/components/form/oph-select';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { OphInput } from '@/app/components/form/oph-input';
import { INPUT_DEBOUNCE_DELAY } from '@/app/lib/constants';
import { ChangePisteSyottoFormParams } from '../pistesyotto-form';

export const KoeCell = ({
  pisteTiedot,
  updateForm,
  koe,
}: {
  pisteTiedot: HakemuksenPistetiedot;
  updateForm: (params: ChangePisteSyottoFormParams) => void;
  koe: Valintakoe;
}) => {
  const { t } = useTranslations();

  const findMatchingKoePisteet = (): ValintakokeenPisteet | undefined =>
    pisteTiedot.valintakokeenPisteet.find((k) => k.tunniste === koe.tunniste);

  const arvoValidator: InputValidator = numberValidator({
    t,
    min: koe.min,
    max: koe.max,
    nullable: true,
  });

  const [arvo, setArvo] = useState<string>(
    findMatchingKoePisteet()?.arvo ?? '',
  );
  const [osallistuminen, setOsallistuminen] =
    useState<ValintakoeOsallistuminen>(
      findMatchingKoePisteet()?.osallistuminen ??
        ValintakoeOsallistuminen.MERKITSEMATTA,
    );

  const [arvoValid, setArvoValid] = useState<boolean>(true);
  const [helperText, setHelperText] = useState<string[] | undefined>();

  const changeArvo = (event: ChangeEvent<HTMLInputElement>) => {
    setArvo(event.target.value);
    const validationResult = arvoValidator.validate(event.target.value);
    setArvoValid(!validationResult.error);
    if (!validationResult.error) {
      debounce(
        () =>
          updateForm({
            value: event.target.value,
            hakemusOid: pisteTiedot.hakemusOid,
            koeTunniste: koe.tunniste,
            updateArvo: true,
          }),
        INPUT_DEBOUNCE_DELAY,
      )();
      setHelperText(undefined);
    } else {
      setHelperText([validationResult.helperText ?? '']);
    }
  };

  const changeSelectArvo = (event: SelectChangeEvent<string>) => {
    setArvo(event.target.value);
    updateForm({
      value: event.target.value,
      hakemusOid: pisteTiedot.hakemusOid,
      koeTunniste: koe.tunniste,
      updateArvo: true,
    });
  };

  const changeOsallistumisenTila = (
    event: SelectChangeEvent<ValintakoeOsallistuminen>,
  ) => {
    setOsallistuminen(event.target.value as ValintakoeOsallistuminen);
    updateForm({
      value: event.target.value,
      hakemusOid: pisteTiedot.hakemusOid,
      koeTunniste: koe.tunniste,
      updateArvo: false,
    });
  };

  const arvoId = `koe-arvo-${pisteTiedot.hakijaOid}-${koe.tunniste}`;

  const getArvoOptions = () => {
    if (koe.inputTyyppi === ValintakoeInputTyyppi.BOOLEAN) {
      return [
        { value: 'true', label: t('yleinen.kylla') },
        { value: 'false', label: t('yleinen.ei') },
      ];
    }
    if (koe.inputTyyppi === ValintakoeInputTyyppi.BOOLEAN_ACCEPTED) {
      return [
        { value: 'true', label: t('yleinen.hyvaksytty') },
        { value: 'false', label: t('yleinen.hylatty') },
      ];
    }
    return koe.arvot?.map((a) => ({ value: a, label: a })) ?? [];
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: '0.6rem',
        minWidth: '220px',
        alignItems: 'flex-start',
      }}
    >
      {koe.inputTyyppi === ValintakoeInputTyyppi.INPUT && (
        <OphFormControl
          error={!arvoValid}
          errorMessages={helperText}
          renderInput={() => (
            <OphInput
              id={arvoId}
              value={arvo}
              inputProps={{ 'aria-label': t('validaatio.numero.syota') }}
              onChange={changeArvo}
              sx={{ width: '5rem' }}
            />
          )}
        />
      )}
      {koe.inputTyyppi != ValintakoeInputTyyppi.INPUT && (
        <OphSelect
          id={arvoId}
          value={arvo}
          options={getArvoOptions()}
          size="small"
          onChange={changeSelectArvo}
          sx={{ minWidth: '150px' }}
          clearable
        />
      )}
      <OphSelect
        id={`koe-osallistuminen-${pisteTiedot.hakijaOid}-${koe.tunniste}`}
        value={osallistuminen}
        options={[
          {
            value: ValintakoeOsallistuminen.OSALLISTUI,
            label: t('valintakoe.osallistumisenTila.OSALLISTUI'),
          },
          {
            value: ValintakoeOsallistuminen.EI_OSALLISTUNUT,
            label: t('valintakoe.osallistumisenTila.EI_OSALLISTUNUT'),
          },
          {
            value: ValintakoeOsallistuminen.MERKITSEMATTA,
            label: t('valintakoe.osallistumisenTila.MERKITSEMATTA'),
          },
          {
            value: ValintakoeOsallistuminen.EI_VAADITA,
            label: t('valintakoe.osallistumisenTila.EI_VAADITA'),
          },
        ]}
        size="small"
        onChange={changeOsallistumisenTila}
        sx={{ minWidth: '150px' }}
      />
    </Box>
  );
};
