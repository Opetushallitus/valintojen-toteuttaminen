import { expect, test } from 'vitest';
import { TranslatedName } from './localization-types';
import { translateName } from './translation-utils';

const school: TranslatedName = { fi: 'koulu', en: 'a school', sv: 'en skola' };

test('Picks translation matching user language', () => {
  expect(translateName(school, 'fi')).toBe('koulu');
  expect(translateName(school, 'en')).toBe('a school');
  expect(translateName(school, 'sv')).toBe('en skola');
});

test('Defaults to finnish language when picking translation', () => {
  expect(translateName(school)).toBe('koulu');
});

test('Uses finnish, then english, then swedish if missing translation', () => {
  expect(translateName({ fi: 'kirja', en: 'a book' }, 'sv')).toBe('kirja');
  expect(translateName({ sv: 'en bok', en: 'a book' }, 'fi')).toBe('a book');
  expect(translateName({ sv: 'en bok' }, 'fi')).toBe('en bok');
});
