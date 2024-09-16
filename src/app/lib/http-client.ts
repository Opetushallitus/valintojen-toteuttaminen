import { getCookies } from './cookie';
import { redirect } from 'next/navigation';
import { configuration } from './configuration';
import { FetchError } from './common';

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

const responseToData = async <Result = unknown>(res: Response) => {
  const contentType = res.headers.get('Content-Type') ?? 'application/json';

  if (contentType?.includes('json')) {
    try {
      const result = { data: (await res.json()) as Result };
      return result;
    } catch (e) {
      console.error('Parsing fetch response body as JSON failed!');
      return Promise.reject(e);
    }
  } else {
    return { data: (await res.text()) as Result };
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

export const client = {
  get: <Result = unknown>(url: string, options: RequestInit = {}) =>
    makeRequest<Result>(new Request(url, { method: 'GET', ...options })),
  post: <Result = unknown>(
    url: string,
    body: NonNullable<unknown>,
    options: RequestInit = {},
  ) =>
    makeRequest<Result>(
      new Request(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        ...options,
      }),
    ),
  put: <Result = unknown>(
    url: string,
    body: NonNullable<unknown>,
    options: RequestInit = {},
  ) =>
    makeRequest<Result>(
      new Request(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        ...options,
      }),
    ),
};
