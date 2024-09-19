import { ServerResponse, createServer } from 'http';
import HAUT from './fixtures/haut.json';
import HAKUKOHTEET from './fixtures/hakukohteet.json';
import HAKUTAPA_CODES from './fixtures/hakutapa.json';
import SIJOITTELUN_YHTEENVETO from './fixtures/sijoittelun_yhteenveto.json';
import VALINTARYHMA from './fixtures/valintaryhma.json';
import HAKENEET from './fixtures/hakeneet.json';
import VALINNANVAIHE from './fixtures/valinnanvaiheet.json';
import LASKETUT_HAKIJARYHMAT from './fixtures/lasketut_hakijaryhmat.json';
import SIJOITTELUAJON_TULOKSET from './fixtures/sijoitteluajon-tulokset.json';
import HAKUKOHTEEN_VALINTATULOKSET from './fixtures/hakukohteen_valintatulokset.json';
import { SERVICE_KEY } from '@/app/lib/permissions';
import PISTETIEDOT from './fixtures/pistetiedot.json';
import KOKEET from './fixtures/valintakoe-avaimet.json';

const port = 3104;

const modifyResponse = (response: ServerResponse, body: unknown) => {
  response.setHeader('content-type', 'application/json');
  response.write(JSON.stringify(body));
  response.end();
};

export default async function playwrightSetup() {
  const server = await createServer(async (request, response) => {
    if (request.url?.endsWith('apply-raamit.js')) {
      response.write('');
      response.end();
      return;
    } else if (request.url?.endsWith(`favicon.ico`)) {
      response.writeHead(404);
      response.end();
      return;
    } else if (
      request.url?.includes(`kayttooikeus-service/henkilo/current/omattiedot`)
    ) {
      const ophOrg = {
        organisaatioOid: '1.2.246.562.10.00000000001',
        kayttooikeudet: [{ palvelu: SERVICE_KEY, oikeus: 'CRUD' }],
      };
      return modifyResponse(response, {
        isAdmin: true,
        organisaatiot: [ophOrg],
      });
    } else if (request.url?.includes(`henkilo/current/asiointiKieli`)) {
      response.setHeader('content-type', 'text/plain');
      response.write('fi');
      response.end();
      return;
    } else if (request.url?.includes(`kouta-internal/haku/search`)) {
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
      request.url?.includes(`koodisto-service/rest/codeelement/codes/hakutapa`)
    ) {
      return modifyResponse(response, HAKUTAPA_CODES);
    } else if (request.url?.includes('kouta-internal/hakukohde/search')) {
      const hakuId = request.url.split('&haku=')[1];
      return modifyResponse(
        response,
        HAKUKOHTEET.filter((hk) => hk.hakuOid === hakuId),
      );
    } else if (request.url?.includes('kouta-internal/hakukohde/')) {
      const hakukohdeOid = request.url.split('/').reverse()[0];
      return modifyResponse(
        response,
        HAKUKOHTEET.find((hk) => hk.oid === hakukohdeOid),
      );
    } else if (request.url?.includes(`kouta-internal/haku/`)) {
      const hakuId = request.url.split('haku/')[1];
      return modifyResponse(
        response,
        HAUT.find((hakuData) => hakuData.oid === hakuId),
      );
    } else if (
      request.url?.includes(
        `valinta-tulos-service/auth/sijoitteluntulos/yhteenveto`,
      )
    ) {
      return modifyResponse(response, SIJOITTELUN_YHTEENVETO);
    } else if (
      request.url?.includes(
        `valintalaskenta-laskenta-service/resources/hakukohde`,
      ) &&
      request.url?.includes('/hakijaryhma')
    ) {
      return modifyResponse(response, LASKETUT_HAKIJARYHMAT);
    } else if (
      request.url?.includes(`valinta-tulos-service/auth/sijoittelu`) &&
      request.url?.includes('sijoitteluajo/latest/hakukohde')
    ) {
      return modifyResponse(response, SIJOITTELUAJON_TULOKSET);
    } else if (
      request.url?.includes(
        `valintalaskentakoostepalvelu/resources/proxy/valintatulosservice/ilmanhakijantilaa/haku`,
      )
    ) {
      return modifyResponse(response, HAKUKOHTEEN_VALINTATULOKSET);
    } else if (
      request.url?.includes(
        'valintaperusteet-service/resources/hakukohde/avaimet',
      )
    ) {
      return modifyResponse(response, KOKEET);
    } else if (
      request.url?.includes(`valintaperusteet-service/resources/hakukohde`) &&
      request.url?.includes('valinnanvaihe?withValisijoitteluTieto=true')
    ) {
      return modifyResponse(response, VALINNANVAIHE);
    } else if (
      request.url?.includes(`valintaperusteet-service/resources/hakukohde`)
    ) {
      return modifyResponse(response, VALINTARYHMA);
    } else if (
      request.url?.includes('lomake-editori/api/external/valinta-ui?')
    ) {
      return modifyResponse(response, HAKENEET);
    } else if (
      request.url?.includes(
        'valintalaskenta-laskenta-service/resources/hakukohde/',
      ) &&
      request.url?.includes('valinnanvaihe')
    ) {
      return modifyResponse(response, []);
    } else if (
      request.url?.includes('ohjausparametrit-service/api/v1/rest/parametri')
    ) {
      return modifyResponse(response, { sijoittelu: true });
    } else if (
      request.url?.includes(
        'valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku',
      )
    ) {
      return modifyResponse(response, PISTETIEDOT);
    } else {
      console.log('(Backend) mock not implementeded', request.url);
      return;
    }
  });
  server.listen(port, () => {
    console.log(`(Backend) Mock server listening on port ${port}`);
  });
  server.once('error', (err) => {
    console.error(err);
  });
}
