import { TFunction } from 'i18next';

export type ValidationResult = {
  error: boolean;
  helperText?: string;
};

export interface InputValidator {
  validate: (v: string) => ValidationResult;
}

export const numberValidator = ({
  t,
  min,
  max,
  nullable,
}: {
  t: TFunction;
  min?: number | string;
  max?: number | string;
  nullable?: boolean;
}): InputValidator => {
  const maxVal =
    max && typeof max != 'number'
      ? Number.parseFloat(max)
      : !!max && (max as number);
  const minVal =
    min && typeof min != 'number'
      ? Number.parseFloat(min)
      : !!min && (min as number);
  return {
    validate: (v: string) => {
      if (nullable && v.length < 1) {
        return { error: false };
      }
      const invalid: boolean =
        v.length < 1 ||
        isNaN(Number(v)) ||
        (!!minVal && minVal > Number(v)) ||
        (!!maxVal && maxVal < Number(v));
      if (invalid) {
        if (v.length < 1 || isNaN(Number(v))) {
          return { error: true, helperText: t('validaatio.numero.syota') };
        }
        if (min && max) {
          return {
            error: true,
            helperText: t('validaatio.numero.minmax', { min, max }),
          };
        } else if (min) {
          return {
            error: true,
            helperText: t('validaatio.numero.min', { min }),
          };
        }
        return {
          error: true,
          helperText: t('validaatio.numero.max', { max }),
        };
      }
      return { error: false };
    },
  };
};
