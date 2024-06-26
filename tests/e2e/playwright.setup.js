import { createServer } from 'http';
import HAUT from './fixtures/haut.json';
import HAKUKOHTEET from './fixtures/hakukohteet.json';
import HAKUTAPA_CODES from './fixtures/hakutapa.json';
import SIJOITTELUN_YHTEENVETO from './fixtures/sijoittelun_yhteenveto.json';
import VALINTARYHMA from './fixtures/valintaryhma.json';
import HAKENEET from './fixtures/hakeneet.json';

const port = 3104;

const modifyResponse = (response, body) => {
  response.write(JSON.stringify(body));
  response.end();
};

export default async function playwrightSetup() {
  const server = await createServer(async (request, response) => {
    if (request.url.endsWith(`favicon.ico`)) {
      response.writeHead(404);
      response.end();
      return;
    } else if (
      request.url.includes(`kayttooikeus-service/henkilo/current/omattiedot`)
    ) {
      return modifyResponse(response, { isAdmin: true, organisaatiot: [] });
    } else if (request.url.includes(`henkilo/current/asiointiKieli`)) {
      response.setHeader('Content-Type', 'text/plain');
      response.write('fi');
      response.end();
      return;
    } else if (request.url.includes(`kouta-internal/haku/search`)) {
      if (request.url.includes('&tarjoaja=')) {
        const tarjoaja = request.url.split('&tarjoaja=')[1];
        return modifyResponse(
          response,
          HAUT.filter((h) => h.organisaatioOid === tarjoaja),
        );
      } else {
        return modifyResponse(response, HAUT);
      }
    } else if (
      request.url.includes(`koodisto-service/rest/codeelement/codes/hakutapa`)
    ) {
      return modifyResponse(response, HAKUTAPA_CODES);
    } else if (request.url.includes('kouta-internal/hakukohde/search')) {
      const hakuId = request.url.split('&haku=')[1];
      return modifyResponse(
        response,
        HAKUKOHTEET.filter((hk) => hk.hakuOid === hakuId),
      );
    } else if (request.url.includes('kouta-internal/hakukohde/')) {
      const hakukohdeOid = request.url.split('/').reverse()[0];
      return modifyResponse(
        response,
        HAKUKOHTEET.find((hk) => hk.oid === hakukohdeOid),
      );
    } else if (request.url.includes(`kouta-internal/haku/`)) {
      const hakuId = request.url.split('haku/')[1];
      return modifyResponse(
        response,
        HAUT.find((hakuData) => hakuData.oid === hakuId),
      );
    } else if (
      request.url.includes(
        `valinta-tulos-service/auth/sijoitteluntulos/yhteenveto`,
      )
    ) {
      return modifyResponse(response, SIJOITTELUN_YHTEENVETO);
    } else if (
      request.url.includes(`valintaperusteet-service/resources/hakukohde`)
    ) {
      return modifyResponse(response, VALINTARYHMA);
    } else if (
      request.url.includes('lomake-editori/api/external/valinta-ui?')
    ) {
      return modifyResponse(response, HAKENEET);
    } else {
      console.log('(Backend) mock not implementeded', request.url);
      return;
    }
  });

  server.listen(port, (error) => {
    console.error(error);
  });
}
