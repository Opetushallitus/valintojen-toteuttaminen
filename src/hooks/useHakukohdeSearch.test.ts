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
      varasijatayttoPaattyy: new Date(future),
      laskettu: false,
    },
    '2': {
      hasValintakoe: false,
      varasijatayttoPaattyy: new Date(past),
      laskettu: true,
    },
    '3': {
      hasValintakoe: true,
      varasijatayttoPaattyy: undefined,
      laskettu: true,
    },
  };

  const haunAsetukset = {
    varasijatayttoPaattyy: undefined,
    sijoittelu: false,
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
      haunAsetukset,
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
      haunAsetukset,
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
      haunAsetukset,
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
      haunAsetukset,
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

  it('filters by varasijatayttoPaattamatta past date from ohjausparametrit when hakukohde date in the future or not defined', () => {
    const result = filterWithSuodatustiedot({
      haunAsetukset: {
        varasijatayttoPaattyy: new Date(past),
        sijoittelu: false,
      },
      hakukohteet,
      suodatustiedot,
      selectedFilters: {
        withValintakoe: false,
        withoutLaskenta: false,
        varasijatayttoPaattamatta: true,
      },
    });
    expect(result.map((h) => h.oid)).toEqual([]);
  });

  it('filters by ohjausparametrit varasijatayttoPaattamatta future date when hakukohde date not defined', () => {
    const result = filterWithSuodatustiedot({
      haunAsetukset: {
        varasijatayttoPaattyy: new Date(future),
        sijoittelu: false,
      },
      hakukohteet,
      suodatustiedot,
      selectedFilters: {
        withValintakoe: false,
        withoutLaskenta: false,
        varasijatayttoPaattamatta: true,
      },
    });
    expect(result.map((h) => h.oid)).toEqual(['1', '3']);
  });

  it('filters by all filters', () => {
    const result = filterWithSuodatustiedot({
      haunAsetukset,
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
      haunAsetukset,
      hakukohteet,
      suodatustiedot: {
        '1': {
          hasValintakoe: true,
          varasijatayttoPaattyy: new Date(past),
          laskettu: true,
        },
        '2': {
          hasValintakoe: false,
          varasijatayttoPaattyy: new Date(future),
          laskettu: true,
        },
        '3': {
          hasValintakoe: false,
          varasijatayttoPaattyy: new Date(past),
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
      haunAsetukset,
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
