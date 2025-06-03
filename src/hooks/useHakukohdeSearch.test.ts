import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { filterWithSuodatustiedot } from './useHakukohdeSearch';

describe('filterWithSuodatustiedot', () => {
  const hakukohteet = [
    { oid: '1', nimi: 'A' },
    { oid: '2', nimi: 'B' },
    { oid: '3', nimi: 'C' },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as Array<any>;

  const now = '2025-01-01T12:00:00';
  const future = '2025-01-01T14:00:00';
  const past = '2025-01-01T10:00:00';

  const suodatustiedot = {
    '1': {
      hasValintakoe: true,
      varasijatayttoPaattyy: future,
      laskettu: false,
    },
    '2': { hasValintakoe: false, varasijatayttoPaattyy: past, laskettu: true },
    '3': { hasValintakoe: true, varasijatayttoPaattyy: null, laskettu: true },
  };

  beforeEach(() => {
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('returns all hakukohteet when no filters are selected', () => {
    const result = filterWithSuodatustiedot({
      hakukohteet,
      suodatustiedot,
      selectedFilters: {
        withValintakoe: false,
        withoutLaskenta: false,
        varasijatayttoPaattamatta: false,
      },
    });
    expect(result.map((h) => h.oid)).toEqual(['1', '2', '3']);
  });

  it('filters by withValintakoe', () => {
    const result = filterWithSuodatustiedot({
      hakukohteet,
      suodatustiedot,
      selectedFilters: {
        withValintakoe: true,
        withoutLaskenta: false,
        varasijatayttoPaattamatta: false,
      },
    });
    expect(result.map((h) => h.oid)).toEqual(['1', '3']);
  });

  it('filters by withoutLaskenta', () => {
    const result = filterWithSuodatustiedot({
      hakukohteet,
      suodatustiedot,
      selectedFilters: {
        withValintakoe: false,
        withoutLaskenta: true,
        varasijatayttoPaattamatta: false,
      },
    });
    expect(result.map((h) => h.oid)).toEqual(['1']);
  });

  it('filters by varasijatayttoPaattamatta (future date)', () => {
    const result = filterWithSuodatustiedot({
      hakukohteet,
      suodatustiedot,
      selectedFilters: {
        withValintakoe: false,
        withoutLaskenta: false,
        varasijatayttoPaattamatta: true,
      },
    });
    expect(result.map((h) => h.oid)).toEqual(['1']);
  });

  it('filters by all filters', () => {
    const result = filterWithSuodatustiedot({
      hakukohteet,
      suodatustiedot,
      selectedFilters: {
        withValintakoe: true,
        withoutLaskenta: true,
        varasijatayttoPaattamatta: true,
      },
    });
    expect(result.map((h) => h.oid)).toEqual(['1']);
  });

  it('returns empty if no hakukohde matches all filters', () => {
    const result = filterWithSuodatustiedot({
      hakukohteet,
      suodatustiedot: {
        '1': {
          hasValintakoe: true,
          varasijatayttoPaattyy: past,
          laskettu: true,
        },
        '2': {
          hasValintakoe: false,
          varasijatayttoPaattyy: future,
          laskettu: true,
        },
        '3': {
          hasValintakoe: false,
          varasijatayttoPaattyy: past,
          laskettu: false,
        },
      },
      selectedFilters: {
        withValintakoe: true,
        withoutLaskenta: true,
        varasijatayttoPaattamatta: true,
      },
    });
    expect(result).toHaveLength(0);
  });

  it('handles missing suodatustiedot gracefully', () => {
    const result = filterWithSuodatustiedot({
      hakukohteet,
      suodatustiedot: {},
      selectedFilters: {
        withValintakoe: true,
        withoutLaskenta: false,
        varasijatayttoPaattamatta: true,
      },
    });
    expect(result).toHaveLength(0);
  });
});
