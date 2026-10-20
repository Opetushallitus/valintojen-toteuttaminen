// Sovelluksen sisäiset linkit. Polut ovat suhteessa react-routerin basenameen,
// joten niitä käytetään Linkin `to`-propin kanssa (ei domainia eikä BASE_PATHia).

export const buildLinkToValintalaskentahistoria = ({
  valintatapajonoOid,
  hakemusOid,
}: {
  valintatapajonoOid: string;
  hakemusOid: string;
}) =>
  `/valintatapajono/${valintatapajonoOid}/hakemus/${hakemusOid}/valintalaskentahistoria`;
