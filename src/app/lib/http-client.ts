import { getCookies } from './cookie';
import { redirect } from 'next/navigation';
import { configuration } from './configuration';
import { FetchError } from './common';
import { isPlainObject } from 'remeda';

const doFetch = async (request: Request) => {
  try {
    const response = await fetch(request);
    return response.status >= 400
      ? Promise.reject(new FetchError(response))
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

const redirectToLogin = () => {
  const loginUrl = new URL(configuration.loginUrl);
  loginUrl.searchParams.set('service', window.location.href);
  if (typeof window === 'undefined') {
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

const DEFAULT_BODY_PARSER = async (res: Response) => await res.text();

const RESPONSE_BODY_PARSERS: Record<string, BodyParser<unknown>> = {
  'application/json': async (response: Response) => await response.json(),
  'application/octet-stream': async (response: Response) =>
    await response.blob(),
};

const responseToData = async <Result = unknown>(res: Response) => {
  // Oletetaan JSON-vastaus, jos content-type header puuttuu
  const contentType =
    res.headers.get('content-type')?.split(';')?.[0] ?? 'application/json';

  const parseBody = (RESPONSE_BODY_PARSERS?.[contentType] ??
    DEFAULT_BODY_PARSER) as BodyParser<Result>;

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
    loginUrl: configuration.koutaInternalLogin,
  },
  {
    urlIncludes: '/lomake-editori',
    loginUrl: configuration.ataruEditoriLogin,
  },
  {
    urlIncludes: '/valinta-tulos-service',
    loginUrl: configuration.valintaTulosServiceLogin,
  },
  {
    urlIncludes: '/valintalaskenta-laskenta-service',
    loginUrl: configuration.valintalaskentaServiceLogin,
  },
  {
    urlIncludes: '/valintalaskentakoostepalvelu',
    loginUrl: configuration.valintalaskentaKoostePalveluLogin,
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
          for (const { urlIncludes, loginUrl } of LOGIN_MAP) {
            if (request?.url?.includes(urlIncludes)) {
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

type JSON = Record<string, unknown> | Array<unknown>;

const isJson = (val: unknown): val is JSON =>
  Array.isArray(val) || isPlainObject(val);

const modRequest = <Result = unknown>(
  method: string,
  url: string | URL,
  body: BodyInit | JSON,
  options: RequestInit,
) => {
  return makeRequest<Result>(
    new Request(url, {
      method,
      body: isJson(body) ? JSON.stringify(body) : body,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      ...options,
    }),
  );
};

export const client = {
  get: <Result = unknown>(url: URL | string, options: RequestInit = {}) =>
    makeRequest<Result>(new Request(url, { method: 'GET', ...options })),
  post: <Result = unknown>(
    url: string | URL,
    body: BodyInit | JSON,
    options: RequestInit = {},
  ) => modRequest<Result>('POST', url, body, options),
  put: <Result = unknown>(
    url: string | URL,
    body: BodyInit | JSON,
    options: RequestInit = {},
  ) => modRequest<Result>('PUT', url, body, options),
} as const;
