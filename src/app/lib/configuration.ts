const DOMAIN =
  process.env.APP_URL ?? process.env.VIRKAILIJA_URL ?? 'https://localhost:3404';

export const isLocalhost = DOMAIN.includes('localhost');

export const isProd = process.env.NODE_ENV === 'production';

interface Configuration {
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

export const configuration: Configuration = {
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
