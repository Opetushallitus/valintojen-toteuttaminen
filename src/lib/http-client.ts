import { getCookies } from './cookie';
import { redirect } from 'next/navigation';
import { FetchError, isServer } from './common';
import { isEmpty, isPlainObject, pathOr } from 'remeda';
import { getConfiguration } from '@/lib/configuration/client-configuration';

export type HttpClientResponse<D> = {
  headers: Headers;
  data: D;
};

const getContentFilename = (headers: Headers) => {
  const contentDisposition = headers.get('content-disposition');
  return contentDisposition?.match(/ filename="(.*)"$/)?.[1];
};

export type FileResult = {
  fileName?: string;
  blob: Blob;
};

export const createFileResult = async (
  response: HttpClientResponse<Blob>,
): Promise<FileResult> => {
  console.assert(response.data instanceof Blob, 'Response data is not a blob');
  return {
    fileName: getContentFilename(response.headers),
    blob: response.data,
  };
};

const doFetch = async (request: Request) => {
  try {
    const response = await fetch(request);
    return response.status >= 400
      ? Promise.reject(new FetchError(response, (await response.text()) ?? ''))
      : Promise.resolve(response);
  } catch (e) {
    return Promise.reject(e);
  }
};

const isUnauthenticated = (response: Response) => {
  return response?.status === 401;
};

const isRedirected = (response: Response) => {
  return response.redirected;
};

const noContent = (response: Response) => {
  return response.status === 204;
};

const redirectToLogin = () => {
  const loginUrl = new URL(getConfiguration().routes.yleiset.loginUrl);
  loginUrl.searchParams.set('service', window.location.href);
  if (isServer) {
    redirect(loginUrl.toString());
  } else {
    window.location.replace(loginUrl.toString());
  }
};

const makeBareRequest = (request: Request) => {
  request.headers.set(
    'Caller-Id',
    '1.2.246.562.10.00000000001.valintojen-toteuttaminen',
  );
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const csrfCookie = getCookies()['CSRF'];
    if (csrfCookie) {
      request.headers.set('CSRF', csrfCookie);
    }
  }

  return doFetch(request);
};

const retryWithLogin = async (request: Request, loginUrl: string) => {
  await makeBareRequest(new Request(loginUrl));
  return makeBareRequest(request);
};

type BodyParser<T> = (res: Response) => Promise<T>;

const TEXT_PARSER = (res: Response) => res.text();
const BLOB_PARSER = (response: Response) => response.blob();

const RESPONSE_BODY_PARSERS: Record<string, BodyParser<unknown>> = {
  'application/json': async (response: Response) => await response.json(),
  'application/octet-stream': BLOB_PARSER,
  'application/pdf': BLOB_PARSER,
  'application/vnd.ms-excel': BLOB_PARSER,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    BLOB_PARSER,
  'binary/octet-stream': BLOB_PARSER,
  'text/plain': TEXT_PARSER,
};

const responseToData = async <Result = unknown>(
  res: Response,
): Promise<{ headers: Headers; data: Result }> => {
  if (noContent(res)) {
    return { headers: res.headers, data: undefined as Result };
  }
  const contentType =
    res.headers.get('content-type')?.split(';')?.[0] ?? 'text/plain';

  const parseBody = (RESPONSE_BODY_PARSERS?.[contentType] ??
    TEXT_PARSER) as BodyParser<Result>;

  try {
    return {
      headers: res.headers,
      data: await parseBody(res),
    };
  } catch (e) {
    console.error(`Parsing fetch response body as "${contentType}" failed!`);
    return Promise.reject(e);
  }
};

const LOGIN_MAP = [
  {
    urlIncludes: '/kouta-internal',
    loginParam: ['koutaInternal', 'koutaInternalLogin'],
  },
  {
    urlIncludes: '/lomake-editori',
    loginParam: ['ataru', 'ataruEditoriLogin'],
  },
  {
    urlIncludes: '/valinta-tulos-service',
    loginParam: ['valintaTulosService', 'valintaTulosServiceLogin'],
  },
  {
    urlIncludes: '/valintalaskenta-laskenta-service',
    loginParam: [
      'valintalaskentaLaskentaService',
      'valintalaskentaServiceLogin',
    ],
  },
  {
    urlIncludes: '/valintalaskentakoostepalvelu',
    loginParam: [
      'valintalaskentakoostepalvelu',
      'valintalaskentaKoostePalveluLogin',
    ],
  },
] as const;

const makeRequest = async <Result>(request: Request) => {
  const originalRequest = request.clone();
  try {
    const response = await makeBareRequest(request);
    const responseUrl = new URL(response.url);
    if (
      isRedirected(response) &&
      responseUrl.pathname.startsWith('/cas/login')
    ) {
      redirectToLogin();
    }
    return responseToData<Result>(response);
  } catch (error: unknown) {
    if (error instanceof FetchError) {
      if (isUnauthenticated(error.response)) {
        try {
          for (const { urlIncludes, loginParam } of LOGIN_MAP) {
            if (request?.url?.includes(urlIncludes)) {
              const config = getConfiguration();
              const loginUrl: string = pathOr(config.routes, loginParam, '');
              if (isEmpty(loginUrl)) {
                throw Error(`Login configuration not found for ${urlIncludes}`);
              }
              const resp = await retryWithLogin(request, loginUrl);
              return responseToData<Result>(resp);
            }
          }
        } catch (e) {
          if (e instanceof FetchError && isUnauthenticated(e.response)) {
            redirectToLogin();
          }
          return Promise.reject(e);
        }
      } else if (
        isRedirected(error.response) &&
        error.response.url === request.url
      ) {
        // Some backend services lose the original method and headers, so we need to do retry with cloned request
        const response = await makeBareRequest(originalRequest);
        return responseToData<Result>(response);
      }
    }
    return Promise.reject(error);
  }
};

type BodyType = BodyInit | JSONData;
type UrlType = string | URL;

export type JSONData = Record<string, unknown> | Array<unknown>;

const isJson = (val: unknown): val is JSONData =>
  Array.isArray(val) || isPlainObject(val);

const modRequest = <Result = unknown>(
  method: string,
  url: UrlType,
  body: BodyType,
  options: RequestInit,
) => {
  return makeRequest<Result>(
    new Request(url, {
      method,
      body: isJson(body) ? JSON.stringify(body) : body,
      ...options,
      headers: {
        ...(isJson(body) ? { 'content-type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
    }),
  );
};

export const client = {
  get: <Result = unknown>(url: UrlType, options: RequestInit = {}) =>
    makeRequest<Result>(new Request(url, { method: 'GET', ...options })),
  post: <Result = unknown>(
    url: UrlType,
    body: BodyType,
    options: RequestInit = {},
  ) => modRequest<Result>('POST', url, body, options),
  put: <Result = unknown>(
    url: UrlType,
    body: BodyType,
    options: RequestInit = {},
  ) => modRequest<Result>('PUT', url, body, options),
  patch: <Result = unknown>(
    url: UrlType,
    body: BodyType,
    options: RequestInit = {},
  ) => modRequest<Result>('PATCH', url, body, options),
  delete: <Result = unknown>(url: UrlType, options: RequestInit = {}) =>
    makeRequest<Result>(new Request(url, { method: 'DELETE', ...options })),
} as const;

const makeAbortable = <D>(
  makePromise: (signal: AbortSignal) => Promise<HttpClientResponse<D>>,
) => {
  const abortController = new AbortController();
  const { signal } = abortController;
  return {
    promise: makePromise(signal),
    abort(reason?: string) {
      abortController.abort(reason);
    },
  };
};

export const abortableClient = {
  get: <Result = unknown>(url: UrlType, options: RequestInit = {}) =>
    makeAbortable((signal) =>
      makeRequest<Result>(
        new Request(url, { method: 'GET', ...options, signal }),
      ),
    ),
  post: <Result = unknown>(
    url: UrlType,
    body: BodyType,
    options: RequestInit = {},
  ) =>
    makeAbortable((signal) =>
      modRequest<Result>('POST', url, body, { ...options, signal }),
    ),
  put: <Result = unknown>(
    url: UrlType,
    body: BodyType,
    options: RequestInit = {},
  ) =>
    makeAbortable((signal) =>
      modRequest<Result>('PUT', url, body, { ...options, signal }),
    ),
} as const;
