import { HttpClientResponse } from './http-client';

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
class CustomError extends Error {
  constructor(message?: string) {
    super(message); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}

export class FetchError extends CustomError {
  response: Response;
  constructor(response: Response, message: string = 'Fetch error') {
    super(message);
    this.response = response;
  }
}

export class OphApiError<D> extends CustomError {
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

export class OphProcessError extends CustomError {
  processObject: Array<OphProcessErrorData>;

  constructor(
    processObject: Array<OphProcessErrorData>,
    message: string = 'OPH Process error',
  ) {
    super(message);
    this.processObject = processObject;
  }
}

const UNAUTHORIZED_MESSAGE =
  'Ei riittäviä käyttöoikeuksia.\n\n Otillräckliga användarrättigheter. \n\n No access rights.';

export class PermissionError extends CustomError {
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

export type GenericEvent = {
  key: string;
  message: string;
  type: 'error' | 'success';
};
