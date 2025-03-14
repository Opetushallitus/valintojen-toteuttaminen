import { expect, test } from 'vitest';
import { numberValidator } from './input-validators';
import { TFunction } from '../localization/useTranslations';

const t: TFunction = ((value: string) => value) as TFunction;

test('validates that input is number', () => {
  const validator = numberValidator({ t });
  expect(validator.validate('saab').error).toBeTruthy();
  expect(validator.validate('=').error).toBeTruthy();
  expect(validator.validate('19').error).toBeFalsy();
  expect(validator.validate('5.4').error).toBeFalsy();
  expect(validator.validate('-800.421').error).toBeFalsy();
  expect(validator.validate('0').error).toBeFalsy();
});

test('doest not allow empty  by default', () => {
  const validator = numberValidator({ t });
  expect(validator.validate('').error).toBeTruthy();
});

test('allows empty', () => {
  const validator = numberValidator({ t, nullable: true });
  expect(validator.validate('').error).toBeFalsy();
});

test('number must be between min and max', () => {
  const validator = numberValidator({ t, min: 4, max: 10 });
  expect(validator.validate('7.5').error).toBeFalsy();
  expect(validator.validate('4').error).toBeFalsy();
  expect(validator.validate('10').error).toBeFalsy();
  expect(validator.validate('3').error).toBeTruthy();
  expect(validator.validate('11').error).toBeTruthy();
  expect(validator.validate('waargh')).toStrictEqual({
    error: true,
    helperText: 'validaatio.numero.syota',
  });
});

test('number must be greater or equal to min', () => {
  const validator = numberValidator({ t, min: 4 });
  expect(validator.validate('7.5').error).toBeFalsy();
  expect(validator.validate('4').error).toBeFalsy();
  expect(validator.validate('10').error).toBeFalsy();
  expect(validator.validate('3').error).toBeTruthy();
  expect(validator.validate('-3').error).toBeTruthy();
  expect(validator.validate('waargh')).toStrictEqual({
    error: true,
    helperText: 'validaatio.numero.syota',
  });
});

test('number must be lesser or equal to max', () => {
  const validator = numberValidator({ t, max: 10 });
  expect(validator.validate('7.5').error).toBeFalsy();
  expect(validator.validate('-4').error).toBeFalsy();
  expect(validator.validate('10').error).toBeFalsy();
  expect(validator.validate('10.5').error).toBeTruthy();
  expect(validator.validate('waargh')).toStrictEqual({
    error: true,
    helperText: 'validaatio.numero.syota',
  });
});
