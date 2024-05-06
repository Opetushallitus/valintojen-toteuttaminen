const DOMAIN = 'https://localhost:3404'; //http://localhost:3104';

interface Configuration {
  serviceUrl: string;
  loginUrl: string;
  sessionCookie: string;
  hautUrl: string;
  hakuUrl: string;
  hakukohteetUrl: string;
  hakukohdeUrl: string;
  kooditUrl: string;
  koutaInternalLogin: string;
  asiointiKieliUrl: string;
}

const serviceUrl =
  process.env.SERVICE_URL ?? `${DOMAIN}${process.env.basePath}`;

export const configuration: Configuration = {
  serviceUrl,
  loginUrl: process.env.LOGIN_URL || `${DOMAIN}/cas/login`,
  sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID',
  hautUrl: `${DOMAIN}/kouta-internal/haku/search?includeHakukohdeOids=false`,
  hakuUrl: `${DOMAIN}/kouta-internal/haku`,
  hakukohteetUrl: `${DOMAIN}/kouta-internal/hakukohde/search?all=false`,
  hakukohdeUrl: `${DOMAIN}/kouta-internal/hakukohde`,
  kooditUrl: `${DOMAIN}/koodisto-service/rest/codeelement/codes/`,
  koutaInternalLogin: `${DOMAIN}/kouta-internal/auth/login`,
  asiointiKieliUrl: `${DOMAIN}/oppijanumerorekisteri-service/henkilo/current/asiointiKieli`,
};
