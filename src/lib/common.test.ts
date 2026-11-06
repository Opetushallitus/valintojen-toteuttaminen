import { describe, expect, test } from 'vitest';
import {
  isHakukohdeOid,
  isHakemusOid,
  isHakukohderyhmaOid,
  isOphOid,
} from './common';

describe.each([
  ['hakukohde', isHakukohdeOid, '1.2.246.562.20.00000000000000000001'],
  ['hakemus', isHakemusOid, '1.2.246.562.11.123'],
  ['hakukohderyhmä', isHakukohderyhmaOid, '1.2.246.562.28.123'],
] as const)('%s-OID', (_, check, valid) => {
  test('hyväksyy oikean tunnisteen', () => expect(check(valid)).toBe(true));
  test('hylkää kirjaimet loppuosassa', () =>
    expect(check(`${valid}a`)).toBe(false));
  test('hylkää puuttuvan loppuosan', () =>
    expect(check(valid.slice(0, valid.lastIndexOf('.') + 1))).toBe(false));
  test('hylkää väärän tyypin', () =>
    expect(check(valid.replace(/562\.\d+\./, '562.99.'))).toBe(false));
  test('hylkää muun merkin pisteen tilalla', () =>
    expect(check(valid.replace('1.2', '1x2'))).toBe(false));
});

test('ryhmä-OID:n loppuosan pituutta ei rajata 20 numeroon', () => {
  expect(isHakukohderyhmaOid('1.2.246.562.28.1')).toBe(true);
  expect(isHakukohderyhmaOid('1.2.246.562.28.00000000000000000001')).toBe(true);
});

test('OPH-alkuosan tarkistus hyväksyy eri tunnistetyypit', () => {
  expect(isOphOid('1.2.246.562.28.123')).toBe(true);
  expect(isOphOid('1.2.246.562.10.123')).toBe(true);
  expect(isOphOid(undefined)).toBe(false);
  expect(isOphOid('1x2.246.562.28.123')).toBe(false);
});
