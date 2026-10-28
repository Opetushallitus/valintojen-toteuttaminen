import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from '@/lib/configuration/configuration-utils';

// Linkit muihin palveluihin. Linkit muodostetaan konfiguraation osoitteista, joten ne ovat
// absoluuttisia. Sovelluksen sisäiset linkit ovat tiedostossa appLinks.ts.

const routes = () => getConfiguration().routes;

// Ataru (hakemusten käsittely)

export const buildLinkToApplication = (hakemusOid: string) =>
  getConfigUrl(routes().ataru.editoriHakemusLinkUrl, { hakemusOid });

// Kouta (tarjonta)

export const buildLinkToHaku = (hakuOid: string) =>
  getConfigUrl(routes().kouta.hakuLinkUrl, { hakuOid });

export const buildLinkToHakukohde = (hakukohdeOid: string) =>
  getConfigUrl(routes().kouta.hakukohdeLinkUrl, { hakukohdeOid });

// Hakukohderyhmäpalvelu

export const buildLinkToHaunAsetukset = (hakuOid: string) =>
  getConfigUrl(routes().hakukohderyhmapalvelu.haunAsetuksetLinkUrl, {
    hakuOid,
  });

// Henkilöpalvelu (oppijanumerorekisteri)

export const buildLinkToOppija = (hakijaOid: string) =>
  getConfigUrl(routes().henkiloUi.oppijaLinkUrl, { hakijaOid });

export const buildLinkToVirkailija = (henkiloOid: string) =>
  getConfigUrl(routes().henkiloUi.virkailijaLinkUrl, { henkiloOid });

// Valintaperusteet

export const buildLinkToValintaperusteetValintaryhma = (
  valintaryhmaOid: string,
) =>
  getConfigUrl(routes().valintaperusteetUi.valintaryhmaLinkUrl, {
    valintaryhmaOid,
  });

export const buildLinkToValintaperusteetHakukohde = (hakukohdeOid: string) =>
  getConfigUrl(routes().valintaperusteetUi.hakukohdeLinkUrl, { hakukohdeOid });

export const buildLinkToValintatapajono = (params: {
  hakukohdeOid: string;
  valinnanvaiheOid: string;
  valintatapajonoOid: string;
}) => getConfigUrl(routes().valintaperusteetUi.valintatapajonoLinkUrl, params);

export const buildLinkToJarjestyskriteeri = (params: {
  hakukohdeOid: string;
  valinnanvaiheOid: string;
  valintatapajonoOid: string;
  jarjestyskriteeriOid: string;
}) =>
  getConfigUrl(routes().valintaperusteetUi.jarjestyskriteeriLinkUrl, params);

// Viestintäpalvelu

export const buildLinkToKirjelahetys = (letterBatchId: string) =>
  getConfigUrl(routes().viestintapalveluUi.kirjelahetysLinkUrl, {
    letterBatchId,
  });

export const buildLinkToViestilahetys = (groupEmailId: number) =>
  getConfigUrl(routes().viestintapalveluUi.viestilahetysLinkUrl, {
    groupEmailId,
  });

// Valintalaskentakoostepalvelu

export const buildLinkToKirjeenEsikatselu = (params: {
  hakuOid: string;
  kirjeenTyyppi: string;
  asiointikieli: string;
}) =>
  getConfigUrl(
    routes().valintalaskentakoostepalvelu.kirjeenEsikatseluLinkUrl,
    params,
  );

export const buildLinkToDokumentti = (dokumenttiId: string) =>
  getConfigUrl(routes().valintalaskentakoostepalvelu.lataaDokumenttiUrl, {
    dokumenttiId,
  });
