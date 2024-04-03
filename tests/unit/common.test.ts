import { expect, test } from 'vitest';
import { getTranslation, Language, TranslatedName } from '../../src/app/lib/common';

const school: TranslatedName = {fi: 'koulu', en: 'a school', sv: 'en skola'}

test('Picks translation matching user language', () => {
  expect(getTranslation(school, Language.FI)).toBe('koulu');
  expect(getTranslation(school, Language.EN)).toBe('a school');
  expect(getTranslation(school, Language.SV)).toBe('en skola');
});

test('Defaults to finnish language when picking translation', () => {
  expect(getTranslation(school)).toBe('koulu');
});

test('Uses finnish, then english, then swedish if missing translation', () => {
  expect(getTranslation({fi: 'kirja', en: 'a book'}, Language.SV)).toBe('kirja');
  expect(getTranslation({sv: 'en bok', en: 'a book'}, Language.FI)).toBe('a book');
  expect(getTranslation({sv: 'en bok'}, Language.FI)).toBe('en bok');
});
