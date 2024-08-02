import { expect, test } from 'vitest';
import { hakemusFilter } from './filters';

const hakemus = {
  hakijanNimi: 'Ruhtinas Nukettaja',
  hakemusOid: '1.2.3.4.5.6',
  hakijaOid: '1.1.2.3.4.5',
};

test('filters by hakijanNimi', () => {
  expect(hakemusFilter(hakemus, 'ruhtinas')).toBeTruthy();
  expect(hakemusFilter(hakemus, 'nuke')).toBeTruthy();
  expect(hakemusFilter(hakemus, 'tina')).toBeTruthy();
  expect(hakemusFilter(hakemus, 'taja')).toBeTruthy();
  expect(hakemusFilter(hakemus, 'kreivi')).toBeFalsy();
  expect(hakemusFilter(hakemus, 'ruu')).toBeFalsy();
  expect(hakemusFilter(hakemus, 'Nukettajan')).toBeFalsy();
  expect(hakemusFilter(hakemus, 'Ruhtinass')).toBeFalsy();
});

test('filters by hakemusOid', () => {
  expect(hakemusFilter(hakemus, '1')).toBeTruthy();
  expect(hakemusFilter(hakemus, '1.2')).toBeTruthy();
  expect(hakemusFilter(hakemus, '1.2.3')).toBeTruthy();
  expect(hakemusFilter(hakemus, '1.2.3.4.5.6')).toBeTruthy();
  expect(hakemusFilter(hakemus, '1.2.3.4.5.6.7')).toBeFalsy();
  expect(hakemusFilter(hakemus, '2.2')).toBeFalsy();
});

test('filters by hakijaOid', () => {
  expect(hakemusFilter(hakemus, '1.1.2.3.4.5')).toBeTruthy();
});
