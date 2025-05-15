'use server';

export async function buildConfiguration() {
  const domain =
    process.env.DEPLOY_VIRKAILIJA_URL ??
    process.env.APP_URL ??
    process.env.VIRKAILIJA_URL ??
    'https://localhost:3404';

  const valintalaskentakerrallaVanha =
    process.env.FEATURE_VALINTALASKENTAKERRALLA_VANHA === 'true';

  return {
    domain: domain,
    routes: {
      yleiset: {
        raamitUrl: `${domain}/virkailija-raamit/apply-raamit.js`,
        loginUrl: process.env.LOGIN_URL || `${domain}/cas/login`,
        sessionCookie: process.env.SESSION_COOKIE || 'JSESSIONID',
        kayttoikeusUrl: `${domain}/kayttooikeus-service/henkilo/current/omattiedot`,
        asiointiKieliUrl: `${domain}/oppijanumerorekisteri-service/henkilo/current/asiointiKieli`,
        lokalisointiUrl: `${domain}/lokalisointi/tolgee`,
        ohjausparametritUrl: `${domain}/ohjausparametrit-service/api/v1/rest/parametri/{hakuOid}`,
        organisaatioParentOidsUrl: `${domain}/organisaatio-service/api/{organisaatioOid}/parentoids`,
      },
      koodisto: {
        kooditUrl: `${domain}/koodisto-service/rest/codeelement/codes/{koodisto}`,
        koodiUrl: `${domain}/koodisto-service/rest/codeelement/latest/{codeElementUri}`,
      },
      koutaInternal: {
        koutaInternalLogin: `${domain}/kouta-internal/auth/login`,
        hakuUrl: `${domain}/kouta-internal/haku/{hakuOid}`,
        hautUrl: `${domain}/kouta-internal/haku/search?includeHakukohdeOids=false`,
        hakukohteetUrl: `${domain}/kouta-internal/hakukohde/search?all=false&haku={hakuOid}`,
        hakukohdeUrl: `${domain}/kouta-internal/hakukohde/{hakukohdeOid}`,
      },
      valintaperusteetService: {
        valintaperusteetUrl: `${domain}/valintaperusteet-service/resources/`,
        automaattinenSiirtoUrl: `${domain}/valintaperusteet-service/resources/V2valintaperusteet/{valintatapajonoOid}/automaattinenSiirto?status={status}`,
        hakukohdeValintakokeetUrl: `${domain}/valintaperusteet-service/resources/hakukohde/{hakukohdeOid}/valintakoe`,
        valintaryhmatHakukohteilla: `${domain}/valintaperusteet-service/resources/puu`,
        onkoHaullaValintaryhma: `${domain}/valintaperusteet-service/resources/valintaryhma/onko-haulla-valintaryhmia/{hakuOid}`,
      },
      ataru: {
        ataruEditoriLogin: `${domain}/lomake-editori/auth/cas`,
        hakemuksetUrl: `${domain}/lomake-editori/api/external/valinta-ui`,
      },
      valintalaskentaLaskentaService: {
        valintalaskentaServiceLogin: `${domain}/valintalaskenta-laskenta-service/auth/login`,
        valintalaskentaServiceUrl: `${domain}/valintalaskenta-laskenta-service/resources/`,
        valintalaskentakerrallaUrl: valintalaskentakerrallaVanha
          ? `${domain}/valintalaskentakoostepalvelu/resources/valintalaskentakerralla`
          : `${domain}/valintalaskenta-laskenta-service/resources/valintalaskentakerralla`,
        hakemuksenValintalaskennanTuloksetUrl: `${domain}/valintalaskenta-laskenta-service/resources/hakemus/{hakuOid}/{hakemusOid}`,
        hakukohteenValintalaskennanTuloksetUrl: `${domain}/valintalaskenta-laskenta-service/resources/hakukohde/{hakukohdeOid}/valinnanvaihe`,
        lasketutHakukohteet: `${domain}/valintalaskenta-laskenta-service/resources/haku/{hakuOid}/lasketut-hakukohteet`,
        hakukohdeHakijaryhmatUrl: `${domain}/valintalaskenta-laskenta-service/resources/hakukohde/{hakukohdeOid}/hakijaryhma`,
        seurantaUrl: `${domain}/valintalaskenta-laskenta-service/resources/seuranta/yhteenveto/`,
        valmisSijoiteltavaksiUrl: `${domain}/valintalaskenta-laskenta-service/resources/valintatapajono/{valintatapajonoOid}/valmissijoiteltavaksi?status={status}`,
        getHarkinnanvaraisetTilatUrl: `${domain}/valintalaskenta-laskenta-service/resources/harkinnanvarainenhyvaksynta/haku/{hakuOid}/hakukohde/{hakukohdeOid}`,
        setHarkinnanvaraisetTilatUrl: `${domain}/valintalaskenta-laskenta-service/resources/harkinnanvarainenhyvaksynta`,
        jarjestyskriteeriMuokkausUrl: `${domain}/valintalaskenta-laskenta-service/resources/valintatapajono/{valintatapajonoOid}/{hakemusOid}/{jarjestyskriteeriPrioriteetti}/jonosija`,
      },
      valintalaskentakoostepalvelu: {
        valintalaskentaKoostePalveluLogin: `${domain}/valintalaskentakoostepalvelu/cas/login`,
        valintalaskentaKoostePalveluUrl: `${domain}/valintalaskentakoostepalvelu/resources/`,
        koostetutPistetiedotHakukohteelleUrl: `${domain}/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku/{hakuOid}/hakukohde/{hakukohdeOid}`,
        koostetutPistetiedotHakemukselleUrl: `${domain}/valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/hakemus/{hakemusOid}`,
        valintalaskennanTulosExcelUrl: `${domain}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintalaskennantulos/aktivoi?hakukohdeOid={hakukohdeOid}`,
        startExportValintatapajonoTulosExcelUrl: `${domain}/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/vienti`,
        startImportValintatapajonoTulosExcelUrl: `${domain}/valintalaskentakoostepalvelu/resources/valintatapajonolaskenta/tuonti`,
        sijoittelunTulosExcelUrl: `${domain}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/sijoitteluntulos/aktivoi`,
        sijoittelunTulosHaulleExcelUrl: `${domain}/valintalaskentakoostepalvelu/resources/sijoitteluntuloshaulle/taulukkolaskennat`,
        valintakoeOsallistumisetUrl: `${domain}/valintalaskentakoostepalvelu/resources/valintakoe/hakutoive/{hakukohdeOid}`,
        startExportValintakoeExcelUrl: `${domain}/valintalaskentakoostepalvelu/resources/valintalaskentaexcel/valintakoekutsut/aktivoi`,
        startExportValintakoeOsoitetarratUrl: `${domain}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/aktivoi`,
        startExportOsoitetarratHakemuksilleUrl: `${domain}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/hakemuksille/aktivoi`,
        startExportOsoitetarratSijoittelussaHyvaksytyilleUrl: `${domain}/valintalaskentakoostepalvelu/resources/viestintapalvelu/osoitetarrat/sijoittelussahyvaksytyille/aktivoi`,
        startExportOsoitetarratHaulleUrl: `${domain}/valintalaskentakoostepalvelu/resources/sijoitteluntuloshaulle/osoitetarrat`,
        startExportPistesyottoExcelUrl: `${domain}/valintalaskentakoostepalvelu/resources/pistesyotto/vienti`,
        kirjepohjat: `${domain}/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/template/getHistory?templateName={templateName}&languageCode={language}&oid={tarjoajaOid}&tag={tag}&applicationPeriod={hakuOid}`,
        tuloskirjeidenMuodostuksenTilanneUrl: `${domain}/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/count/haku/{hakuOid}`,
        julkaiseTuloskirjeetUrl: `${domain}/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/publish/haku/{hakuOid}`,
        hyvaksymiskirjeetUrl: `${domain}/valintalaskentakoostepalvelu/resources/viestintapalvelu/hyvaksymiskirjeet/aktivoi`,
        dokumenttiSeurantaUrl: `${domain}/valintalaskentakoostepalvelu/resources/dokumentinseuranta/{uuid}`,
        eihyvaksymiskirjeetUrl: `${domain}/valintalaskentakoostepalvelu/resources/viestintapalvelu/hakukohteessahylatyt/aktivoi`,
        jalkiohjauskirjeetUrl: `${domain}/valintalaskentakoostepalvelu/resources/viestintapalvelu/jalkiohjauskirjeet/aktivoi`,
        lahetaEPostiUrl: `${domain}/valintalaskentakoostepalvelu/resources/viestintapalvelu/securelinkit/aktivoi`,
        dokumentitUrl: `${domain}/valintalaskentakoostepalvelu/resources/dokumentit/{tyyppi}/{hakukohdeOid}`,
        dokumenttiProsessiUrl: `${domain}/valintalaskentakoostepalvelu/resources/dokumenttiprosessi/{id}`,
        lataaDokumenttiUrl: `${domain}/valintalaskentakoostepalvelu/resources/dokumentit/lataa/{dokumenttiId}`,
        startImportPistesyottoUrl: `${domain}/valintalaskentakoostepalvelu/resources/pistesyotto/tuonti`,
        harkinnanvaraisuudetHakemuksilleUrl: `${domain}/valintalaskentakoostepalvelu/resources/harkinnanvaraisuus/hakemuksille`,
        myohastyneetHakemuksetUrl: `${domain}/valintalaskentakoostepalvelu/resources/proxy/valintatulosservice/myohastyneet/haku/{hakuOid}/hakukohde/{hakukohdeOid}`,
        hakijanTilatValintatapajonolleUrl: `${domain}/valintalaskentakoostepalvelu/resources/proxy/valintatulosservice/tilahakijalle/haku/{hakuOid}/hakukohde/{hakukohdeOid}/valintatapajono/{valintatapajonoOid}`,
        startImportErillishakuValinnanTulosUrl: `${domain}/valintalaskentakoostepalvelu/resources/erillishaku/tuonti/ui`,
        startExportErillishakuValinnanTulosExcelUrl: `${domain}/valintalaskentakoostepalvelu/resources/erillishaku/vienti`,
      },
      valintaTulosService: {
        valintaTulosServiceLogin: `${domain}/valinta-tulos-service/auth/login`,
        valintaTulosServiceUrl: `${domain}/valinta-tulos-service/auth/`,
        hakemuksenSijoitteluajonTuloksetUrl: `${domain}/valinta-tulos-service/auth/sijoittelu/{hakuOid}/sijoitteluajo/latest/hakemus/{hakemusOid}`,
        valinnanTulosMuokkausUrl: `${domain}/valinta-tulos-service/auth/valinnan-tulos/{valintatapajonoOid}`,
        hakemuksenValinnanTulosUrl: `${domain}/valinta-tulos-service/auth/valinnan-tulos/hakemus/?hakemusOid={hakemusOid}`,
        vastaanottopostiHakemukselleUrl: `${domain}/valinta-tulos-service/auth/emailer/run/hakemus/{hakemusOid}`,
        vastaanottopostiHakukohteelleUrl: `${domain}/valinta-tulos-service/auth/emailer/run/hakukohde/{hakukohdeOid}`,
        vastaanottopostiJonolleUrl: `${domain}/valinta-tulos-service/auth/emailer/run/hakukohde/{hakukohdeOid}/valintatapajono/{valintatapajonoOid}`,
        muutoshistoriaHakemukselleUrl: `${domain}/valinta-tulos-service/auth/muutoshistoria?valintatapajonoOid={valintatapajonoOid}&hakemusOid={hakemusOid}`,
        hakukohteenValinnanTulosUrl: `${domain}/valinta-tulos-service/auth/valinnan-tulos?hakuOid={hakuOid}&hakukohdeOid={hakukohdeOid}`,
        sijoittelunTuloksenPerustiedotHaulleUrl: `${domain}/valinta-tulos-service/auth/sijoittelu/{hakuOid}/sijoitteluajo/latest/perustiedot`,
      },
      sijoittelu: {
        kaynnistaSijoittelu: `${domain}/sijoittelu-service/resources/koostesijoittelu/aktivoi?hakuOid={hakuOid}`,
        sijoittelunStatus: `${domain}/sijoittelu-service/resources/koostesijoittelu/status/{hakuOid}`,
        getAjastettuSijoittelu: `${domain}/sijoittelu-service/resources/koostesijoittelu/jatkuva?hakuOid={hakuOid}`,
        createAjastettuSijoittelu: `${domain}/sijoittelu-service/resources/koostesijoittelu/jatkuva`,
        updateAjastettuSijoittelu: `${domain}/sijoittelu-service/resources/koostesijoittelu/jatkuva/paivita`,
        deleteAjastettuSijoittelu: `${domain}/sijoittelu-service/resources/koostesijoittelu/jatkuva/poista?hakuOid={hakuOid}`,
      },
      // valintalaskenta-ui (vanha käyttöliittymä)
      // TODO: Poista kun korvattu uudella käyttöliittymällä
      valintalaskentahistoriaLinkUrl: `${domain}/valintalaskenta-ui/app/index.html#/valintatapajono/{valintatapajonoOid}/hakemus/{hakemusOid}/valintalaskentahistoria`,
      hakukohderyhmapalvelu: {
        haunAsetuksetLinkUrl: `${domain}/hakukohderyhmapalvelu/haun-asetukset?hakuOid={hakuOid}`,
      },
    },
  };
}
