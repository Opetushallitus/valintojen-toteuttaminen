// Sovelluksen sisäiset linkit. Polut ovat suhteessa react-routerin basenameen,
// joten niitä käytetään Linkin `to`-propin kanssa (ei domainia eikä BASE_PATHia).
// Linkit muihin palveluihin ovat tiedostossa externalLinks.ts.

export const buildLinkToHakuPage = (hakuOid: string) => `/haku/${hakuOid}`;

export const buildLinkToHakuTab = ({
  hakuOid,
  tabName,
}: {
  hakuOid: string;
  tabName: string;
}) => `/haku/${hakuOid}/${tabName}`;

export const buildLinkToHakukohdeTab = ({
  hakuOid,
  hakukohdeOid,
  tabRoute,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  tabRoute: string;
}) => `/haku/${hakuOid}/hakukohde/${hakukohdeOid}/${tabRoute}`;

export const buildLinkToValintaryhmaPage = ({
  hakuOid,
  valintaryhmaOid,
}: {
  hakuOid: string;
  valintaryhmaOid: string;
}) => `/haku/${hakuOid}/valintaryhma/${valintaryhmaOid}`;

export const buildLinkToHenkiloPage = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => `/haku/${hakuOid}/henkilo/${hakemusOid}`;

export const buildLinkToValintalaskentahistoria = ({
  valintatapajonoOid,
  hakemusOid,
}: {
  valintatapajonoOid: string;
  hakemusOid: string;
}) =>
  `/valintatapajono/${valintatapajonoOid}/hakemus/${hakemusOid}/valintalaskentahistoria`;
