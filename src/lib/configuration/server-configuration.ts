'use server';

const VALINTALASKENTAKERRALLA_VANHA =
  process.env.NEXT_PUBLIC_VALINTALASKENTAKERRALLA_VANHA === 'true';

export type Configuration = {
  domain: string;
  routes: {
    yleiset: Record<string, string>;
    koodisto: Record<string, string>;
    koutaInternal: Record<string, string>;
    valintaperusteetService: Record<string, string>;
    ataru: Record<string, string>;
    valintalaskentaLaskentaService: Record<string, string>;
    valintalaskentakoostepalvelu: Record<string, string>;
    valintaTulosService: Record<string, string>;
    sijoittelu: Record<string, string>;
    valintalaskentahistoriaLinkUrl: string;
    hakukohderyhmapalvelu: Record<string, string>;
  };
};

export async function buildConfiguration(): Promise<Configuration> {
  const DOMAIN =
    process.env.DEPLOY_VIRKAILIJA_URL ??
    process.env.APP_URL ??
    process.env.VIRKAILIJA_URL ??
    'https://localhost:3404';

  return {
    domain: DOMAIN,
    routes: {
      yleiset: {
        raamitUrl: `${DOMAIN}/virkailija-raamit/apply-raamit.js`,
        loginUrl: process.env.LOGIN_URL || `${DOMAIN}/cas/login`,
        sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID',
        kayttoikeusUrl: `${DOMAIN}/kayttooikeus-service/henkilo/current/omattiedot`,
        asiointiKieliUrl: `${DOMAIN}/oppijanumerorekisteri-service/henkilo/current/asiointiKieli`,
        lokalisointiUrl: `${DOMAIN}/lokalisointi/tolgee`,
        ohjausparametritUrl: `${DOMAIN}/ohjausparametrit-service/api/v1/rest/parametri/{hakuOid}`,
        organisaatioParentOidsUrl: `${DOMAIN}/organisaatio-service/api/{organisaatioOid}/parentoids`,
      },
      koodisto: {
        kooditUrl: `${DOMAIN}/koodisto-service/rest/codeelement/codes/{koodisto}`,
        koodiUrl: `${DOMAIN}/koodisto-service/rest/codeelement/latest/{codeElementUri}`,
      },
      koutaInternal: {
        koutaInternalLogin: `${DOMAIN}/kouta-internal/auth/login`,
        hakuUrl: `${DOMAIN}/kouta-internal/haku/{hakuOid}`,
        hautUrl: `${DOMAIN}/kouta-internal/haku/search?includeHakukohdeOids=false`,
        hakukohteetUrl: `${DOMAIN}/kouta-internal/hakukohde/search?all=false&haku={hakuOid}`,
        hakukohdeUrl: `${DOMAIN}/kouta-internal/hakukohde/{hakukohdeOid}`,
      },
      valintaperusteetService: {
        valintaperusteetUrl: `${DOMAIN}/valintaperusteet-service/resources/`,
        automaattinenSiirtoUrl: `${DOMAIN}/valintaperusteet-service/resources/V2valintaperusteet/{valintatapajonoOid}/automaattinenSiirto?status={status}`,
        hakukohdeValintakokeetUrl: `${DOMAIN}/valintaperusteet-service/resources/hakukohde/{hakukohdeOid}/valintakoe`,
        valintaryhmatHakukohteilla: `${DOMAIN}/valintaperusteet-service/resources/puu`,
        onkoHaullaValintaryhma: `${DOMAIN}/valintaperusteet-service/resources/valintaryhma/onko-haulla-valintaryhmia/{hakuOid}`,
      },
      ataru: {
        ataruEditoriLogin: `${DOMAIN}/lomake-editori/auth/cas`,
        hakemuksetUrl: `${DOMAIN}/lomake-editori/api/external/valinta-ui`,
      },
      valintalaskentaLaskentaService: {
        valintalaskentaServiceLogin: `${DOMAIN}/valintalaskenta-laskenta-service/auth/login`,
        valintalaskentaServiceUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/`,
        valintalaskentakerrallaUrl: VALINTALASKENTAKERRALLA_VANHA
          ? `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentakerralla`
          : `${DOMAIN}/valintalaskenta-laskenta-service/resources/valintalaskentakerralla`,
        hakemuksenValintalaskennanTuloksetUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakemus/{hakuOid}/{hakemusOid}`,
        hakukohteenValintalaskennanTuloksetUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakukohde/{hakukohdeOid}/valinnanvaihe`,
        lasketutHakukohteet: `${DOMAIN}/valintalaskenta-laskenta-service/resources/haku/{hakuOid}/lasketut-hakukohteet`,
        hakukohdeHakijaryhmatUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/hakukohde/{hakukohdeOid}/hakijaryhma`,
        seurantaUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/`,
        valmisSijoiteltavaksiUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/valintatapajono/{valintatapajonoOid}/valmissijoiteltavaksi?status={status}`,
        getHarkinnanvaraisetTilatUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/harkinnanvarainenhyvaksynta/haku/{hakuOid}/hakukohde/{hakukohdeOid}`,
        setHarkinnanvaraisetTilatUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/harkinnanvarainenhyvaksynta`,
        jarjestyskriteeriMuokkausUrl: `${DOMAIN}/valintalaskenta-laskenta-service/resources/valintatapajono/{valintatapajonoOid}/{hakemusOid}/{jarjestyskriteeriPrioriteetti}/jonosija`,
      },
      valintalaskentakoostepalvelu: {
        valintalaskentaKoostePalveluLogin: `${DOMAIN}/valintalaskentakoostepalvelu/cas/login`,
        valintalaskentaKoostePalveluUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/`,
        koostetutPistetiedotHakukohteelleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/{hakuOid}/hakukohde/{hakukohdeOid}`,
        koostetutPistetiedotHakemukselleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/hakemus/{hakemusOid}`,
        valintalaskennanTulosExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintalaskennantulos/aktivoi?hakukohdeOid={hakukohdeOid}`,
        startExportValintatapajonoTulosExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/vienti`,
        startImportValintatapajonoTulosExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/tuonti`,
        sijoittelunTulosExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/sijoitteluntulos/aktivoi`,
        sijoittelunTulosHaulleExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/sijoitteluntuloshaulle/taulukkolaskennat`,
        valintakoeOsallistumisetUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintakoe/hakutoive/{hakukohdeOid}`,
        startExportValintakoeExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintakoekutsut/aktivoi`,
        startExportValintakoeOsoitetarratUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/aktivoi`,
        startExportOsoitetarratHakemuksilleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/hakemuksille/aktivoi`,
        startExportOsoitetarratSijoittelussaHyvaksytyilleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/sijoittelussahyvaksytyille/aktivoi`,
        startExportOsoitetarratHaulleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/sijoitteluntuloshaulle/osoitetarrat`,
        startExportPistesyottoExcelUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/vienti`,
        kirjepohjat: `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/template/getHistory?templateName={templateName}&languageCode={language}&oid={tarjoajaOid}&tag={tag}&applicationPeriod={hakuOid}`,
        tuloskirjeidenMuodostuksenTilanneUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/count/haku/{hakuOid}`,
        julkaiseTuloskirjeetUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/publish/haku/{hakuOid}`,
        hyvaksymiskirjeetUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/hyvaksymiskirjeet/aktivoi`,
        dokumenttiSeurantaUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumentinseuranta/{uuid}`,
        eihyvaksymiskirjeetUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/hakukohteessahylatyt/aktivoi`,
        jalkiohjauskirjeetUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/jalkiohjauskirjeet/aktivoi`,
        lahetaEPostiUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/viestintapalvelu/securelinkit/aktivoi`,
        dokumentitUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumentit/{tyyppi}/{hakukohdeOid}`,
        dokumenttiProsessiUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/{id}`,
        lataaDokumenttiUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/dokumentit/lataa/{dokumenttiId}`,
        startImportPistesyottoUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/pistesyotto/tuonti`,
        harkinnanvaraisuudetHakemuksilleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/harkinnanvaraisuus/hakemuksille`,
        myohastyneetHakemuksetUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/valintatulosservice/myohastyneet/haku/{hakuOid}/hakukohde/{hakukohdeOid}`,
        hakijanTilatValintatapajonolleUrl: `${DOMAIN}/valintalaskentakoostepalvelu/resources/proxy/valintatulosservice/tilahakijalle/haku/{hakuOid}/hakukohde/{hakukohdeOid}/valintatapajono/{valintatapajonoOid}`,
      },
      valintaTulosService: {
        valintaTulosServiceLogin: `${DOMAIN}/valinta-tulos-service/auth/login`,
        valintaTulosServiceUrl: `${DOMAIN}/valinta-tulos-service/auth/`,
        hakemuksenSijoitteluajonTuloksetUrl: `${DOMAIN}/valinta-tulos-service/auth/sijoittelu/{hakuOid}/sijoitteluajo/latest/hakemus/{hakemusOid}`,
        valinnanTulosMuokkausUrl: `${DOMAIN}/valinta-tulos-service/auth/valinnan-tulos/{valintatapajonoOid}`,
        hakemuksenValinnanTulosUrl: `${DOMAIN}/valinta-tulos-service/auth/valinnan-tulos/hakemus/?hakemusOid={hakemusOid}`,
        vastaanottopostiHakemukselleUrl: `${DOMAIN}/valinta-tulos-service/auth/emailer/run/hakemus/{hakemusOid}`,
        vastaanottopostiHakukohteelleUrl: `${DOMAIN}/valinta-tulos-service/auth/emailer/run/hakukohde/{hakukohdeOid}`,
        vastaanottopostiJonolleUrl: `${DOMAIN}/valinta-tulos-service/auth/emailer/run/hakukohde/{hakukohdeOid}/valintatapajono/{valintatapajonoOid}`,
        muutoshistoriaHakemukselleUrl: `${DOMAIN}/valinta-tulos-service/auth/muutoshistoria?valintatapajonoOid={valintatapajonoOid}&hakemusOid={hakemusOid}`,
        // -------------------------------------------------------------------------------------------------
        sijoittelunTuloksenPerustiedotHaulleUrl: `${DOMAIN}/valinta-tulos-service/auth/sijoittelu/{hakuOid}/sijoitteluajo/latest/perustiedot`,
      },
      sijoittelu: {
        kaynnistaSijoittelu: `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/aktivoi?hakuOid={hakuOid}`,
        sijoittelunStatus: `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/status/{hakuOid}`,
        getAjastettuSijoittelu: `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/jatkuva?hakuOid={hakuOid}`,
        createAjastettuSijoittelu: `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/jatkuva`,
        updateAjastettuSijoittelu: `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/jatkuva/paivita`,
        deleteAjastettuSijoittelu: `${DOMAIN}/sijoittelu-service/resources/koostesijoittelu/jatkuva/poista?hakuOid={hakuOid}`,
      },
      // valintalaskenta-ui (vanha käyttöliittymä)
      // TODO: Poista kun korvattu uudella käyttöliittymällä
      valintalaskentahistoriaLinkUrl: `${DOMAIN}/valintalaskenta-ui/app/index.html#/valintatapajono/{valintatapajonoOid}/hakemus/{hakemusOid}/valintalaskentahistoria`,
      hakukohderyhmapalvelu: {
        haunAsetuksetLinkUrl: `${DOMAIN}/hakukohderyhmapalvelu/haun-asetukset?hakuOid={hakuOid}`,
      },
    },
  };
}
