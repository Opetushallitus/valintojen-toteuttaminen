'use client';

import {
  InputValidator,
  numberValidator,
} from '@/app/components/form/input-validators';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useState, ChangeEvent } from 'react';
import {
  OphFormFieldWrapper,
  OphInput,
} from '@opetushallitus/oph-design-system';

export const PisteetInput = ({
  min,
  max,
  disabled,
  value,
  onChange,
  arvoId,
  ariaLabel,
}: {
  min?: number | string;
  max?: number | string;
  value?: number | string;
  disabled?: boolean;
  onChange?: (arvo: string) => void;
  arvoId?: string;
  ariaLabel?: string;
}) => {
  const [arvoValid, setArvoValid] = useState<boolean>(true);

  const { t } = useTranslations();

  const arvoValidator: InputValidator = numberValidator({
    t,
    min,
    max,
    nullable: true,
  });

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const changeArvo = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
    const validationResult = arvoValidator.validate(event.target.value);
    setArvoValid(!validationResult.error);
    if (!validationResult.error) {
      setErrorMessage(undefined);
    } else {
      setErrorMessage(validationResult.helperText);
    }
  };

  return (
    <OphFormFieldWrapper
      error={!arvoValid}
      errorMessage={errorMessage}
      disabled={disabled}
      renderInput={() => (
        <OphInput
          sx={{ maxWidth: '80px' }}
          id={arvoId}
          value={value}
          inputProps={{ 'aria-label': ariaLabel ?? t('pistesyotto.pisteet') }}
          onChange={changeArvo}
        />
      )}
    />
  );
};
