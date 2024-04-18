import { getCookies } from './cookie';
import { redirect } from 'next/navigation';
import { configuration } from './configuration';

const doFetch = async (request: Request) => {
  try {
    const response = await fetch(request);
    return response.status >= 400
      ? Promise.reject(response)
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
  redirect(loginUrl.toString());
};

const makeBareRequest = (request: Request) => {
  const { method } = request;
  let modifiedOptions: RequestInit = {
    headers: {
      'Caller-id': '1.2.246.562.10.00000000001.valintojen-toteuttaminen',
    },
  };
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfCookie = getCookies()['CSRF'];
    if (csrfCookie) {
      modifiedOptions.headers = {
        CSRF: csrfCookie,
      };
    }
  }

  return doFetch(new Request(request, modifiedOptions));
};

const retryWithLogin = async (request: any, loginUrl: string) => {
  await makeBareRequest(new Request(loginUrl));
  return await makeBareRequest(request);
};

const responseToData = async (res: Response) => {
  const contentType = res.headers.get('Content-Type') ?? 'application/json';

  if (contentType?.includes('json')) {
    try {
      const result = { data: await res.json() };
      return result;
    } catch (e) {
      console.error('Parsing fetch response body as JSON failed!');
      return Promise.reject(e);
    }
  } else {
    return { data: await res.text() };
  }
};

const makeRequest = async <T>(request: Request) => {
  try {
    const response = await makeBareRequest(request);

    if (isRedirected(response)) {
      if (response.url.includes('/cas/login')) {
        redirectToLogin();
      }
    }

    return responseToData(response);
  } catch (error: unknown) {
    if (error instanceof Response) {
      if (isUnauthenticated(error)) {
        try {
          if (request?.url?.includes('/kouta-internal')) {
            const resp = await retryWithLogin(
              request,
              configuration.koutaInternalLogin,
            );

            return responseToData(resp);
          }
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }
    return Promise.reject(error);
  }
};

export const client = {
  get: (url: string, options: RequestInit = {}) =>
    makeRequest(new Request(url, { method: 'GET', ...options })),
  post: (url: string, options: RequestInit = {}) =>
    makeRequest(new Request(url, { method: 'POST', ...options })),
};
