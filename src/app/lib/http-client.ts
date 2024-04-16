import xior, { XiorError, XiorInterceptorRequestConfig } from "xior";
import { getCookies } from "./cookie";
import { redirect } from "next/navigation";
import { configuration } from "./configuration";

const createClient = () => {
  const client_ = xior.create({
    headers: {
      Accept: "application/json",
      "Caller-id": "1.2.246.562.10.00000000001.valintojen-toteuttaminen",
    },
  });

  client_.interceptors.request.use(
    (request: XiorInterceptorRequestConfig<any>) => {
      const { method } = request;
      if (["post", "put", "patch", "delete"].includes(method)) {
        const csrfCookie = getCookies()["CSRF"];
        if (csrfCookie) {
          request.headers.CSRF = csrfCookie;
        }
      }
      return request;
    }
  );
  return client_;
};

export const client = createClient();

const bareClient = createClient();

const isUnauthorized = (error: XiorError) => {
  return error.response?.status === 401;
};

const isRedirected = (response: Response) => {
  return response.redirected;
};

const retryWithLogin = async (request: any, loginUrl: string) => {
  await bareClient.request(loginUrl);
  return await bareClient.request(request);
};

client.interceptors.response.use(
  (data) => {
    if (isRedirected(data.response)) {
      if (data.response.url.includes("/cas/login")) {
        const loginUrl = new URL(configuration.loginUrl);
        loginUrl.searchParams.set("service", window.location.href);
        redirect(loginUrl.toString());
      }
    }
    // NOTE: oppijanumerorekisteri ohjautuu tässä omaan login-service-osoitteeseensa, josta tulee 406, mutta sen jälkeen pyynnöt toimii
    return data;
  },
  async (error) => {
    console.log(error);
    if (isUnauthorized(error)) {
      const request = error.request;
      try {
        if (request?.url?.includes("/kouta-internal")) {
          return await retryWithLogin(
            request,
            configuration.koutaInternalLogin
          );
        }
      } catch (e) {
        console.error(`Retry with login failed for request: ${request?.url}`);
      }
    }

    // Ei autentikaatiota, ohjataan login-sivulle!
    const loginUrl = new URL(configuration.loginUrl);
    loginUrl.searchParams.set("service", window.location.href);
    redirect(loginUrl.toString());
  }
);
