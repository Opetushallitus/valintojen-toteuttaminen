'use client';

import {
  InputValidator,
  numberValidator,
} from '@/app/components/form/input-validators';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { useTranslations } from '@/app/hooks/useTranslations';
import { useState, ChangeEvent } from 'react';
import { type KoeInputsProps } from './koe-inputs';
import { OphInput } from '@opetushallitus/oph-design-system';

export const PisteetInput = ({
  koe,
  disabled,
  arvo,
  onArvoChange,
  arvoId,
}: Pick<KoeInputsProps, 'koe'> & {
  arvo: string;
  disabled: boolean;
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
          inputProps={{ 'aria-label': t('pistesyotto.pisteet') }}
          onChange={changeArvo}
        />
      )}
    />
  );
};
