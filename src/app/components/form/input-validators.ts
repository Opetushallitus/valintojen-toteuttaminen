export type ValidationResult = {
  error: boolean;
  helperText?: string;
};

export interface InputValidator {
  validate: (v: string) => ValidationResult;
}

export const numberValidator = ({
  min,
  max,
  nullable,
}: {
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
      const result: boolean =
        (nullable && v.length < 1) ||
        (!Number.isNaN(v) &&
          (!minVal || minVal <= Number.parseFloat(v)) &&
          (!maxVal || maxVal >= Number.parseFloat(v)));
      if (!result) {
        //TODO translate
        if (min && max) {
          return {
            error: true,
            helperText: `Syötä numero väliltä ${min}-${max}`,
          };
        } else if (min) {
          return {
            error: true,
            helperText: `Syötä numero yhtä suuri tai isompi kuin ${min}`,
          };
        } else if (max) {
          return {
            error: true,
            helperText: `Syötä numero yhtä suuri tai pienempi kuin ${max}`,
          };
        } else {
          return { error: true, helperText: 'Syötä numero' };
        }
      }
      return { error: false };
    },
  };
};
