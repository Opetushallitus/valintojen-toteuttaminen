import { describe, expect, test } from 'vitest';
import { ClientLoaderFunctionArgs } from 'react-router';
import { clientLoader } from './page';

const BASE_URL = 'http://localhost/valintojen-toteuttaminen/';

const runClientLoader = (url: string) =>
  clientLoader({
    request: new Request(url),
  } as ClientLoaderFunctionArgs);

const getThrownResponse = (url: string) => {
  try {
    runClientLoader(url);
  } catch (e) {
    return e as Response;
  }
  throw new Error('Expected clientLoader to throw a redirect');
};

describe('Etusivun clientLoader', () => {
  test('lisää tila=julkaistu URL:iin korvaavalla uudelleenohjauksella', () => {
    const response = getThrownResponse(`${BASE_URL}?search=abc`);

    expect(response.status).toBe(302);
    expect(response.headers.get('X-Remix-Replace')).toBe('true');
    const location = new URL(response.headers.get('Location')!);
    expect(location.pathname).toBe('/valintojen-toteuttaminen/');
    expect(location.searchParams.get('tila')).toBe('julkaistu');
    expect(location.searchParams.get('search')).toBe('abc');
  });

  test('ei ohjaa uudelleen, jos tila on valittu', () => {
    expect(runClientLoader(`${BASE_URL}?tila=arkistoitu`)).toBeNull();
  });

  test('ei ohjaa uudelleen, jos käyttäjä on tyhjentänyt tilan', () => {
    expect(runClientLoader(`${BASE_URL}?tila=`)).toBeNull();
  });
});
