import { describe, test, expect } from 'vitest';
import { isInRange } from './time-utils';

describe('isInRange', () => {
  test('returns false if before start', () => {
    expect(
      isInRange('2022-01-01T12:00:00', '2022-01-01T12:00:01', undefined),
    ).toEqual(false);
  });
  test('returns true if after start', () => {
    expect(
      isInRange('2022-01-01T12:00:01', '2022-01-01T12:00:00', undefined),
    ).toEqual(true);
  });
  test('returns true if before end', () => {
    expect(
      isInRange('2022-01-01T12:00:00', undefined, '2022-01-01T12:00:01'),
    ).toEqual(true);
  });
  test('returns false if after', () => {
    expect(
      isInRange('2022-01-01T12:00:01', undefined, '2022-01-01T12:00:00'),
    ).toEqual(false);
  });
  test('returns true if no start or end given', () => {
    expect(isInRange('2022-01-01T12:00:01', undefined, undefined)).toEqual(
      true,
    );
  });
  test('returns false if at start border', () => {
    expect(
      isInRange('2022-01-01T12:00:00', '2022-01-01T12:00:00', undefined),
    ).toEqual(false);
  });
  test('returns false if at end border', () => {
    expect(
      isInRange('2022-01-01T12:00:00', undefined, '2022-01-01T12:00:00'),
    ).toEqual(false);
  });
});
