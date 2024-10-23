'use client';
import {
  InputValidator,
  numberValidator,
} from '@/app/components/form/input-validators';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { OphInput } from '@/app/components/form/oph-input';
import { useTranslations } from '@/app/hooks/useTranslations';
import { INPUT_DEBOUNCE_DELAY } from '@/app/lib/constants';
import { debounce } from '@mui/material';
import { useState, ChangeEvent } from 'react';
import { type KoeCellProps } from './koe-cell';

export const ArvoInput = ({
  pisteTiedot,
  updateForm,
  koe,
  disabled,
  arvo,
  onArvoChange,
  arvoId,
}: KoeCellProps & {
  arvo: string;
  onArvoChange: (arvo: string) => void;
  arvoId: string;
}) => {
  const [arvoValid, setArvoValid] = useState<boolean>(true);

  const { t } = useTranslations();

  const arvoValidator: InputValidator = numberValidator({
    t,
    min: koe.min,
    max: koe.max,
    nullable: true,
  });

  const [helperText, setHelperText] = useState<string[] | undefined>();

  const changeArvo = (event: ChangeEvent<HTMLInputElement>) => {
    onArvoChange(event.target.value);
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

  return (
    <OphFormControl
      error={!arvoValid}
      errorMessages={helperText}
      disabled={disabled}
      renderInput={() => (
        <OphInput
          id={arvoId}
          value={arvo}
          inputProps={{ 'aria-label': t('validaatio.numero.syota') }}
          onChange={changeArvo}
        />
      )}
    />
  );
};
