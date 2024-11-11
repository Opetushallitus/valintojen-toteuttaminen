export const DOMAIN =
  process.env.APP_URL ?? process.env.VIRKAILIJA_URL ?? 'https://localhost:3404';

export const isLocalhost = DOMAIN.includes('localhost');

export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const isTesting = process.env.TEST === 'true';

type ValintatapajonoStatusParams = {
  valintatapajonoOid: string;
  status: boolean;
};

export const configuration = {
  raamitUrl: `${DOMAIN}/virkailija-raamit/apply-raamit.js`,
  loginUrl: process.env.LOGIN_URL || `${DOMAIN}/cas/login`,
  sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID',
  kayttoikeusUrl: `${DOMAIN}/kayttooikeus-service/henkilo/current/omattiedot`,
  hautUrl: `${DOMAIN}/kouta-internal/haku/search?includeHakukohdeOids=false`,
  hakuUrl: `${DOMAIN}/kouta-internal/haku`,
  hakukohteetUrl: `${DOMAIN}/kouta-internal/hakukohde/search?all=false`,
  hakukohdeUrl: `${DOMAIN}/kouta-internal/hakukohde`,
  kooditUrl: `${DOMAIN}/koodisto-service/rest/codeelement/codes/`,
  koodiUrl: (codeElementUri: string) =>
    `${DOMAIN}/koodisto-service/rest/codeelement/latest/${codeElementUri}`,
  koutaInternalLogin: `${DOMAIN}/kouta-internal/auth/login`,
  asiointiKieliUrl: `${DOMAIN}/oppijanumerorekisteri-service/henkilo/current/asiointiKieli`,
  lokalisaatioUrl: `${DOMAIN}/lokalisointi/cxf/rest/v1/localisation?category=valintojen-toteuttaminen&locale=`,
  valintaperusteetUrl: `${DOMAIN}/valintaperusteet-service/resources/`,
  valintaTulosServiceUrl: `${DOMAIN}/valinta-tulos-service/auth/`,
  valintaTulosServiceLogin: `${DOMAIN}/valinta-tulos-service/auth/login`,
  hakemuksetUrl: `${DOMAIN}/lomake-editori/api/external/valinta-ui`,
  ataruEditoriLogin: `${DOMAIN}/lomake-editori/auth/cas`,
  valintalaskentaServiceLogin: `${DOMAIN}/valintalaskenta-laskenta-service/auth/login`,
  valintalaskentaKoostePalveluUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/`,
  koostetutPistetiedot: ({
    hakuOid,
    hakukohdeOid,
  }: {
    hakuOid: string;
    hakukohdeOid: string;
  }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  valintalaskentaKoostePalveluLogin: `${DOMAIN}/valintalaskentakoostepalvelu/cas/login`,
  hakukohteenLasketutValinnanVaiheetUrl: ({
    hakukohdeOid,
  }: {
    hakukohdeOid: string;
  }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakukohde/${hakukohdeOid}/valinnanvaihe`,
  hakemuksenLasketutValinnanvaiheetUrl: ({
    hakuOid,
    hakemusOid,
  }: {
    hakuOid: string;
    hakemusOid: string;
  }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakemus/${hakuOid}/${hakemusOid}`,
  seurantaUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/`,
  ohjausparametritUrl: `${DOMAIN}/ohjausparametrit-service/api/v1/rest/parametri`,
  hakukohdeHakijaryhmatUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakukohde/${hakukohdeOid}/hakijaryhma`,
  valintalaskentahistoriaUrl: ({
    valintatapajonoOid,
    hakemusOid,
  }: {
    valintatapajonoOid: string;
    hakemusOid: string;
  }) =>
    `${DOMAIN}/valintalaskenta-ui/app/index.html#/valintatapajono/${valintatapajonoOid}/hakemus/${hakemusOid}/valintalaskentahistoria`,
  valintalaskennanTulosExcelUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintalaskennantulos/aktivoi?hakukohdeOid=${hakukohdeOid}`,
  valmisSijoiteltavaksiUrl: ({
    valintatapajonoOid,
    status,
  }: ValintatapajonoStatusParams) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/valintatapajono/${valintatapajonoOid}/valmissijoiteltavaksi?status=${status}`,
  automaattinenSiirtoUrl: ({
    valintatapajonoOid,
    status,
  }: ValintatapajonoStatusParams) =>
    `${DOMAIN}/valintaperusteet-service/resources/V2valintaperusteet/${valintatapajonoOid}/automaattinenSiirto?status=${status}`,
  hakukohdeValintakokeetUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintaperusteet-service/resources/hakukohde/${hakukohdeOid}/valintakoe`,
  valintakoeOsallistumisetUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintakoe/hakutoive/${hakukohdeOid}`,
  startExportValintakoeExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintakoekutsut/aktivoi`,
  startExportValintakoeOsoitetarratUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/aktivoi`,
  startExportOsoitetarratHakemuksilleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/hakemuksille/aktivoi`,
  startExportPistesyottoExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/vienti`,
  dokumenttiProsessiUrl: ({ id }: { id: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/${id}`,
  lataaDokumenttiUrl: ({ dokumenttiId }: { dokumenttiId: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumentit/lataa/${dokumenttiId}`,
  startImportPistesyottoUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/tuonti`,
  harkinnanvaraisuudetHakemuksilleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/harkinnanvaraisuus/hakemuksille`,
  getHarkinnanvaraisetTilatUrl: ({
    hakuOid,
    hakukohdeOid,
  }: {
    hakuOid: string;
    hakukohdeOid: string;
  }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/harkinnanvarainenhyvaksynta/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  setHarkinnanvaraisetTilatUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/harkinnanvarainenhyvaksynta`,
  kayttaaValintalaskentaaUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintaperusteet/hakukohde/${hakukohdeOid}/kayttaaValintalaskentaa`,
  hakemuksenSijoitteluajonTuloksetUrl: ({
    hakuOid,
    hakemusOid,
  }: {
    hakuOid: string;
    hakemusOid: string;
  }) =>
    `${DOMAIN}/valinta-tulos-service/auth/sijoittelu/${hakuOid}/sijoitteluajo/latest/hakemus/${hakemusOid}`,
} as const;
