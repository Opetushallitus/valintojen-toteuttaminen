import { DokumenttiTyyppi } from './valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-types';

export const DOMAIN =
  process.env.APP_URL ?? process.env.VIRKAILIJA_URL ?? 'https://localhost:3404';

export const isLocalhost = DOMAIN.includes('localhost');

export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const isTesting = Boolean(process.env.TEST);

export const localTranslations = process.env.LOCAL_TRANSLATIONS === 'true';

export const xstateInspect = process.env.XSTATE_INSPECT === 'true';

type ValintatapajonoStatusParams = {
  valintatapajonoOid: string;
  status: boolean;
};

const VALINTALASKENTAKERRALLA_VANHA =
  process.env.NEXT_PUBLIC_VALINTALASKENTAKERRALLA_VANHA === 'true';

export const configuration = {
  // yleiset
  raamitUrl: `${DOMAIN}/virkailija-raamit/apply-raamit.js`,
  loginUrl: process.env.LOGIN_URL || `${DOMAIN}/cas/login`,
  sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID',
  kayttoikeusUrl: `${DOMAIN}/kayttooikeus-service/henkilo/current/omattiedot`,
  asiointiKieliUrl: `${DOMAIN}/oppijanumerorekisteri-service/henkilo/current/asiointiKieli`,
  lokalisointiUrl: `${DOMAIN}/lokalisointi/tolgee`,
  ohjausparametritUrl: `${DOMAIN}/ohjausparametrit-service/api/v1/rest/parametri`,
  organisaatioParentOidsUrl: (organisaatioOid: string) =>
    `${DOMAIN}/organisaatio-service/api/${organisaatioOid}/parentoids`,

  // -------------------------------------------------------------------------------------------------
  // koodisto
  kooditUrl: `${DOMAIN}/koodisto-service/rest/codeelement/codes/`,
  koodiUrl: (codeElementUri: string) =>
    `${DOMAIN}/koodisto-service/rest/codeelement/latest/${codeElementUri}`,

  // -------------------------------------------------------------------------------------------------
  // kouta-internal
  koutaInternalLogin: `${DOMAIN}/kouta-internal/auth/login`,
  hakuUrl: `${DOMAIN}/kouta-internal/haku`,
  hautUrl: `${DOMAIN}/kouta-internal/haku/search?includeHakukohdeOids=false`,
  hakukohteetUrl: `${DOMAIN}/kouta-internal/hakukohde/search?all=false`,
  hakukohdeUrl: `${DOMAIN}/kouta-internal/hakukohde`,

  // -------------------------------------------------------------------------------------------------
  // valintaperusteet-service
  valintaperusteetUrl: `${DOMAIN}/valintaperusteet-service/resources/`,

  automaattinenSiirtoUrl: ({
    valintatapajonoOid,
    status,
  }: ValintatapajonoStatusParams) =>
    `${DOMAIN}/valintaperusteet-service/resources/V2valintaperusteet/${valintatapajonoOid}/automaattinenSiirto?status=${status}`,
  hakukohdeValintakokeetUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintaperusteet-service/resources/hakukohde/${hakukohdeOid}/valintakoe`,
  valintaryhmatHakukohteilla: `${DOMAIN}/valintaperusteet-service/resources/puu`,
  onkoHaullaValintaryhma: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/valintaperusteet-service/resources/valintaryhma/onko-haulla-valintaryhmia/${hakuOid}`,
  // -------------------------------------------------------------------------------------------------
  // ataru
  ataruEditoriLogin: `${DOMAIN}/lomake-editori/auth/cas`,
  hakemuksetUrl: `${DOMAIN}/lomake-editori/api/external/valinta-ui`,

  // -------------------------------------------------------------------------------------------------
  // valintalaskenta-laskenta-service
  valintalaskentaServiceLogin: `${DOMAIN}/valintalaskenta-laskenta-service/auth/login`,
  valintalaskentaServiceUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/`,
  valintalaskentakerrallaUrl: VALINTALASKENTAKERRALLA_VANHA
    ? `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentakerralla`
    : `${DOMAIN}/valintalaskenta-laskenta-service/resources/valintalaskentakerralla`,
  hakemuksenValintalaskennanTuloksetUrl: ({
    hakuOid,
    hakemusOid,
  }: {
    hakuOid: string;
    hakemusOid: string;
  }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakemus/${hakuOid}/${hakemusOid}`,
  hakukohteenValintalaskennanTuloksetUrl: ({
    hakukohdeOid,
  }: {
    hakukohdeOid: string;
  }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakukohde/${hakukohdeOid}/valinnanvaihe`,
  lasketutHakukohteet: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/haku/${hakuOid}/lasketut-hakukohteet`,
  hakukohdeHakijaryhmatUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakukohde/${hakukohdeOid}/hakijaryhma`,
  seurantaUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/`,
  valmisSijoiteltavaksiUrl: ({
    valintatapajonoOid,
    status,
  }: ValintatapajonoStatusParams) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/valintatapajono/${valintatapajonoOid}/valmissijoiteltavaksi?status=${status}`,
  getHarkinnanvaraisetTilatUrl: ({
    hakuOid,
    hakukohdeOid,
  }: {
    hakuOid: string;
    hakukohdeOid: string;
  }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/harkinnanvarainenhyvaksynta/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  setHarkinnanvaraisetTilatUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/harkinnanvarainenhyvaksynta`,
  jarjestyskriteeriMuokkausUrl: ({
    valintatapajonoOid,
    hakemusOid,
    jarjestyskriteeriPrioriteetti,
  }: {
    valintatapajonoOid: string;
    hakemusOid: string;
    jarjestyskriteeriPrioriteetti: number;
  }) =>
    `${DOMAIN}/valintalaskenta-laskenta-service/resources/valintatapajono/${valintatapajonoOid}/${hakemusOid}/${jarjestyskriteeriPrioriteetti}/jonosija`,

  // -------------------------------------------------------------------------------------------------
  // valintalaskentakoostepalvelu
  valintalaskentaKoostePalveluLogin: `${DOMAIN}/valintalaskentakoostepalvelu/cas/login`,
  valintalaskentaKoostePalveluUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/`,
  koostetutPistetiedotHakukohteelleUrl: ({
    hakuOid,
    hakukohdeOid,
  }: {
    hakuOid: string;
    hakukohdeOid: string;
  }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  koostetutPistetiedotHakemukselleUrl: ({
    hakemusOid,
  }: {
    hakemusOid: string;
  }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/hakemus/${hakemusOid}`,
  valintalaskennanTulosExcelUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintalaskennantulos/aktivoi?hakukohdeOid=${hakukohdeOid}`,
  startExportValintatapajonoTulosExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/vienti`,
  startImportValintatapajonoTulosExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/tuonti`,
  sijoittelunTulosExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/sijoitteluntulos/aktivoi`,
  sijoittelunTulosHaulleExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/sijoitteluntuloshaulle/taulukkolaskennat`,
  valintakoeOsallistumisetUrl: ({ hakukohdeOid }: { hakukohdeOid: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintakoe/hakutoive/${hakukohdeOid}`,
  startExportValintakoeExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintakoekutsut/aktivoi`,
  startExportValintakoeOsoitetarratUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/aktivoi`,
  startExportOsoitetarratHakemuksilleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/hakemuksille/aktivoi`,
  startExportOsoitetarratSijoittelussaHyvaksytyilleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/sijoittelussahyvaksytyille/aktivoi`,
  startExportOsoitetarratHaulleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/sijoitteluntuloshaulle/osoitetarrat`,
  startExportPistesyottoExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/vienti`,
  kirjepohjat: ({
    templateName,
    language,
    tarjoajaOid,
    tag,
    hakuOid,
  }: {
    templateName: string;
    language: string;
    tag: string;
    tarjoajaOid: string;
    hakuOid: string;
  }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/template/getHistory?templateName=${templateName}&languageCode=${language}&oid=${tarjoajaOid}&tag=${tag}&applicationPeriod=${hakuOid}`,
  tuloskirjeidenMuodostuksenTilanneUrl: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/count/haku/${hakuOid}`,
  julkaiseTuloskirjeetUrl: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/publish/haku/${hakuOid}`,
  hyvaksymiskirjeetUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/hyvaksymiskirjeet/aktivoi`,
  dokumenttiSeurantaUrl: ({ uuid }: { uuid: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumentinseuranta/${uuid}`,
  eihyvaksymiskirjeetUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/hakukohteessahylatyt/aktivoi`,
  jalkiohjauskirjeetUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/jalkiohjauskirjeet/aktivoi`,
  lahetaEPostiUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/securelinkit/aktivoi`,
  dokumentitUrl: ({
    tyyppi,
    hakukohdeOid,
  }: {
    tyyppi: DokumenttiTyyppi;
    hakukohdeOid: string;
  }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumentit/${tyyppi}/${hakukohdeOid}`,
  dokumenttiProsessiUrl: ({ id }: { id: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/${id}`,
  lataaDokumenttiUrl: ({ dokumenttiId }: { dokumenttiId: string }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumentit/lataa/${dokumenttiId}`,
  startImportPistesyottoUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/tuonti`,
  harkinnanvaraisuudetHakemuksilleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/harkinnanvaraisuus/hakemuksille`,
  myohastyneetHakemuksetUrl: ({
    hakuOid,
    hakukohdeOid,
  }: {
    hakuOid: string;
    hakukohdeOid: string;
  }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/valintatulosservice/myohastyneet/haku/${hakuOid}/hakukohde/${hakukohdeOid}`,
  hakijanTilatValintatapajonolleUrl: ({
    hakuOid,
    hakukohdeOid,
    valintatapajonoOid,
  }: {
    hakuOid: string;
    hakukohdeOid: string;
    valintatapajonoOid: string;
  }) =>
    `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/valintatulosservice/tilahakijalle/haku/${hakuOid}/hakukohde/${hakukohdeOid}/valintatapajono/${valintatapajonoOid}`,
  // -------------------------------------------------------------------------------------------------
  // valinta-tulos-service
  valintaTulosServiceLogin: `${DOMAIN}/valinta-tulos-service/auth/login`,
  valintaTulosServiceUrl: `${DOMAIN}/valinta-tulos-service/auth/`,
  hakemuksenSijoitteluajonTuloksetUrl: ({
    hakuOid,
    hakemusOid,
  }: {
    hakuOid: string;
    hakemusOid: string;
  }) =>
    `${DOMAIN}/valinta-tulos-service/auth/sijoittelu/${hakuOid}/sijoitteluajo/latest/hakemus/${hakemusOid}`,
  valinnanTulosMuokkausUrl: ({
    valintatapajonoOid,
  }: {
    valintatapajonoOid: string;
  }) =>
    `${DOMAIN}/valinta-tulos-service/auth/valinnan-tulos/${valintatapajonoOid}`,
  hakemuksenValinnanTulosUrl: ({ hakemusOid }: { hakemusOid: string }) =>
    `${DOMAIN}/valinta-tulos-service/auth/valinnan-tulos/hakemus/?hakemusOid=${hakemusOid}`,
  vastaanottopostiHakemukselleUrl: ({ hakemusOid }: { hakemusOid: string }) =>
    `${DOMAIN}/valinta-tulos-service/auth/emailer/run/hakemus/${hakemusOid}`,
  vastaanottopostiHakukohteelleUrl: ({
    hakukohdeOid,
  }: {
    hakukohdeOid: string;
  }) =>
    `${DOMAIN}/valinta-tulos-service/auth/emailer/run/hakukohde/${hakukohdeOid}`,
  vastaanottopostiJonolleUrl: ({
    hakukohdeOid,
    valintatapajonoOid,
  }: {
    hakukohdeOid: string;
    valintatapajonoOid: string;
  }) =>
    `${DOMAIN}/valinta-tulos-service/auth/emailer/run/hakukohde/${hakukohdeOid}/valintatapajono/${valintatapajonoOid}`,
  muutoshistoriaHakemukselleUrl: ({
    hakemusOid,
    valintatapajonoOid,
  }: {
    hakemusOid: string;
    valintatapajonoOid: string;
  }) =>
    `${DOMAIN}/valinta-tulos-service/auth/muutoshistoria?valintatapajonoOid=${valintatapajonoOid}&hakemusOid=${hakemusOid}`,
  // -------------------------------------------------------------------------------------------------
  sijoittelunTuloksenPerustiedotHaulleUrl: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/valinta-tulos-service/auth/sijoittelu/${hakuOid}/sijoitteluajo/latest/perustiedot`,
  // sijoittelu
  kaynnistaSijoittelu: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/aktivoi?hakuOid=${hakuOid}`,
  sijoittelunStatus: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/status/${hakuOid}`,
  getAjastettuSijoittelu: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/jatkuva?hakuOid=${hakuOid}`,
  createAjastettuSijoittelu: `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/jatkuva`,
  updateAjastettuSijoittelu: `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/jatkuva/paivita`,
  deleteAjastettuSijoittelu: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/jatkuva/poista?hakuOid=${hakuOid}`,
  // -------------------------------------------------------------------------------------------------
  // valintalaskenta-ui (vanha käyttöliittymä)
  // TODO: Poista kun korvattu uudella käyttöliittymällä
  valintalaskentahistoriaLinkUrl: ({
    valintatapajonoOid,
    hakemusOid,
  }: {
    valintatapajonoOid: string;
    hakemusOid: string;
  }) =>
    `${DOMAIN}/valintalaskenta-ui/app/index.html#/valintatapajono/${valintatapajonoOid}/hakemus/${hakemusOid}/valintalaskentahistoria`,
  // -------------------------------------------------------------------------------------------------
  // hakukohderyhmapalvelu
  haunAsetuksetLinkUrl: ({ hakuOid }: { hakuOid: string }) =>
    `${DOMAIN}/hakukohderyhmapalvelu/haun-asetukset?hakuOid=${hakuOid}`,
} as const;
