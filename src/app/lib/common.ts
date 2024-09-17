export class FetchError extends Error {
  response: Response;
  constructor(response: Response, message: string = 'Fetch error') {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FetchError.prototype);
    this.response = response;
  }
}

const UNAUTHORIZED_MESSAGE =
  'Ei riittäviä käyttöoikeuksia.\n\n Otillräckliga användarrättigheter. \n\n No access rights.';

export class PermissionError extends Error {
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

export const EMPTY_ARRAY = Object.freeze([]) as Array<never>;

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
