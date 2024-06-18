export const DOMAIN =
  process.env.APP_URL ?? process.env.VIRKAILIJA_URL ?? 'https://localhost:3404';

export const isLocalhost = DOMAIN.includes('localhost');

export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const configuration = {
  loginUrl: process.env.LOGIN_URL || `${DOMAIN}/cas/login`,
  sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID',
  kayttoikeusUrl: `${DOMAIN}/kayttooikeus-service/henkilo/current/omattiedot`,
  hautUrl: `${DOMAIN}/kouta-internal/haku/search?includeHakukohdeOids=false`,
  hakuUrl: `${DOMAIN}/kouta-internal/haku`,
  hakukohteetUrl: `${DOMAIN}/kouta-internal/hakukohde/search?all=false`,
  hakukohdeUrl: `${DOMAIN}/kouta-internal/hakukohde`,
  kooditUrl: `${DOMAIN}/koodisto-service/rest/codeelement/codes/`,
  koutaInternalLogin: `${DOMAIN}/kouta-internal/auth/login`,
  asiointiKieliUrl: `${DOMAIN}/oppijanumerorekisteri-service/henkilo/current/asiointiKieli`,
  lokalisaatioUrl: `${DOMAIN}/lokalisointi/cxf/rest/v1/localisation?category=valintojen-toteuttaminen&locale=`,
  valintaperusteetUrl: `${DOMAIN}/valintaperusteet-service/resources/`,
  valintaTulosServiceUrl: `${DOMAIN}/valinta-tulos-service/auth/`,
  valintaTulosServiceLogin: `${DOMAIN}/valinta-tulos-service/auth/login`,
  hakemuksetUrl: `${DOMAIN}/lomake-editori/api/external/valinta-ui`,
  ataruEditoriLogin: `${DOMAIN}/lomake-editori/auth/cas`,
  valintalaskentaServiceLogin: `${DOMAIN}/valintalaskenta-laskenta-service/auth/login`,
  lasketutValinnanVaiheetUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakukohde/${hakukohdeOid}/valinnanvaihe`,
} as const;
