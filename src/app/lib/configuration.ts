const DOMAIN = process.env.APP_URL ?? 'https://localhost:3404';

interface Configuration {
  loginUrl: string;
  sessionCookie: string;
  hautUrl: string;
  hakuUrl: string;
  hakukohteetUrl: string;
  kooditUrl: string;
  koutaInternalLogin: string;
  asiointiKieliUrl: string;
}

export const configuration: Configuration = {
  loginUrl: process.env.LOGIN_URL || `${DOMAIN}/cas/login`,
  sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID',
  hautUrl: `${DOMAIN}/kouta-internal/haku/search?includeHakukohdeOids=false`,
  hakuUrl: `${DOMAIN}/kouta-internal/haku`,
  hakukohteetUrl: `${DOMAIN}/kouta-internal/hakukohde/search?all=false`,
  kooditUrl: `${DOMAIN}/koodisto-service/rest/codeelement/codes/`,
  koutaInternalLogin: `${DOMAIN}/kouta-internal/auth/login`,
  asiointiKieliUrl: `${DOMAIN}/oppijanumerorekisteri-service/henkilo/current/asiointiKieli`,
};
