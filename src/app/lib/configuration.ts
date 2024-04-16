const DOMAIN = 'https://localhost:3404'; //http://localhost:3104';

interface Configuration  {
    serviceUrl: string,
    loginUrl: string,
    sessionCookie: string,
    hautUrl: string,
    hakuUrl: string,
    hakukohteetUrl: string,
    kooditUrl: string
};

export const configuration: Configuration = {
    serviceUrl: process.env.SERVICE_URL || 'https://localhost:3404',
    loginUrl: process.env.LOGIN_URL || `${DOMAIN}/cas/login?service=https://localhost:3404/api/login`,
    sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID',
    hautUrl: `${DOMAIN}/kouta-internal/haku/search`,
    hakuUrl: `${DOMAIN}/kouta-internal/haku`,
    hakukohteetUrl: `${DOMAIN}/kouta-internal/hakukohde/search?all=false`,
    kooditUrl: `${DOMAIN}/koodisto-service/rest/codeelement/codes/`
};
