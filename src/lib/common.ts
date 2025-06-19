import { HttpClientResponse } from './http-client';

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
class OphCustomError extends Error {
  constructor(message?: string) {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class FetchError extends OphCustomError {
  response: Response;
  constructor(response: Response, message: string = 'Fetch error') {
    super(message);
    this.response = response;
  }
}

export class OphApiError<D> extends OphCustomError {
  response: HttpClientResponse<D>;
  constructor(
    response: HttpClientResponse<D>,
    message: string = 'OPH API error',
  ) {
    super(message);
    this.response = response;
  }
}

export type OphProcessErrorData = {
  id: string;
  message: string;
  isService?: boolean;
};

export class OphProcessError extends OphCustomError {
  processObject: Array<OphProcessErrorData>;

  constructor(
    processObject: Array<OphProcessErrorData>,
    message: string = 'OPH Process error',
  ) {
    super(message);
    this.processObject = processObject;
  }
}

export class OphErrorWithTitle extends OphCustomError {
  title: string;

  constructor(title: string, message: string) {
    super(message);
    this.title = title;
  }
}

const UNAUTHORIZED_MESSAGE =
  'Ei riittäviä käyttöoikeuksia.\n\n Otillräckliga användarrättigheter. \n\n No access rights.';

export class PermissionError extends OphCustomError {
  constructor(message: string = UNAUTHORIZED_MESSAGE) {
    super(message);
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export const booleanToString = (value: boolean) =>
  value === true ? 'true' : 'false';

export const isEmpty = (value: unknown) => {
  return (
    value == null ||
    (isObject(value) && Object.keys(value).length === 0) ||
    (Array.isArray(value) && value.length === 0)
  );
};

export const EMPTY_OBJECT = Object.freeze({});
export const EMPTY_ARRAY = Object.freeze([]) as Array<never>;
export const EMPTY_STRING_SET = Object.freeze(new Set<string>());

export function downloadBlob(fileName: string, data: Blob) {
  const link = document.createElement('a');
  const url = window.URL.createObjectURL(data);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.setAttribute('style', 'display: none');
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  link.remove();
}

export const isServer = typeof window === 'undefined';

export const isHakukohdeOid = (value: string) =>
  /^1\.2\.246\.562\.20\.\d{20}$/.test(value);

export const isHakemusOid = (value: string) =>
  /^1\.2\.246\.562\.11\./.test(value);

export type GenericEvent = {
  key: string;
  message: string;
  type: 'error' | 'success';
};

export const nullWhen404 = async <T>(
  promise: Promise<T>,
): Promise<T | null> => {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof FetchError && e?.response?.status === 404) {
      console.error('FetchError with 404', e);
      return Promise.resolve(null);
    }
    throw e;
  }
};

export const isOphOid = (x?: string) => x?.startsWith('1.2.246.562.');

/**
 * Assertioiden tekemiseen xstate-tilakoneiden fromPromise-aktoreiden kanssa.
 * Oletuksena ei virhettä ei logiteta, vaikka palautetaan rejektoitu promise.
 * Siksi logitetaan viesti myös konsoliin, jotta debuggaaminen ei hankaloidu.
 */
export const rejectAndLog = (message: string) => {
  console.error(message);
  return Promise.reject(new Error(message));
};

export type NonEmpty<T> = Array<T> & { 0: T };

export const pointToComma = (val?: string | number): string | undefined =>
  val?.toString().replace('.', ',');

export const commaToPoint = (val?: string | number): string | undefined =>
  val?.toString().replace(',', '.');
