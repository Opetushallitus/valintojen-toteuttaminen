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
import SIJOITTELUN_TULOS_HAKUKOHTEELLE from './fixtures/sijoittelun-tulos.json';
import HAKUKOHTEEN_VALINTATULOKSET from './fixtures/hakukohteen_valintatulokset.json';
import { VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY } from '@/lib/permissions';
import PISTETIEDOT from './fixtures/pistetiedot.json';
import KOKEET from './fixtures/valintakoe-avaimet.json';
import EHDOT from './fixtures/hyvaksynnan_ehdot.json';
import VALINTARYHMA_PUU from './fixtures/valintaryhma-puu.json';
import VASTAANOTTOTILAT_HAKIJOILLE from './fixtures/valintatapajonon-hakijoiden-vastaanottotila.json';
import { OPH_ORGANIZATION_OID } from '@/lib/constants';
import KIRJEIDEN_MUODOSTUKSEN_TILANNE from './fixtures/kirjeiden-muodostuksen-tilanne.json';
import VALINTATIEDOT_HAKUKOHTEITTAIN from './fixtures/valintatiedot-hakukohteittain.json';
import KOULUTUSTYYPIT from './fixtures/koulutustyypit.json';

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
    } else if (request.url?.endsWith(`/kayttaaValintalaskentaa`)) {
      return modifyResponse(response, { kayttaaValintalaskentaa: true });
    } else if (
      request.url?.includes(`kayttooikeus-service/henkilo/current/omattiedot`)
    ) {
      return modifyResponse(response, {
        organisaatiot: [
          {
            organisaatioOid: OPH_ORGANIZATION_OID,
            kayttooikeudet: [
              { palvelu: VALINTOJEN_TOTEUTTAMINEN_SERVICE_KEY, oikeus: 'CRUD' },
            ],
          },
        ],
      });
    } else if (request.url?.endsWith('/parentoids')) {
      return modifyResponse(response, [OPH_ORGANIZATION_OID]);
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
    } else if (
      request.url?.includes(
        `koodisto-service/rest/codeelement/codes/hyvaksynnanehdot`,
      )
    ) {
      return modifyResponse(response, EHDOT);
    } else if (
      request.url?.includes(
        `koodisto-service/rest/codeelement/codes/koulutustyyppi`,
      )
    ) {
      return modifyResponse(response, KOULUTUSTYYPIT);
    } else if (request.url?.includes('kouta-internal/hakukohde/search')) {
      const url = new URL(request.url, `http://localhost:${port}`);

      const hakuId = url.searchParams.get('haku');
      const tarjoajaOids = url.searchParams.getAll('tarjoaja');

      return modifyResponse(
        response,
        HAKUKOHTEET.filter(
          (hk) =>
            hk.hakuOid === hakuId &&
            (tarjoajaOids.length === 0 || tarjoajaOids.includes(hk.tarjoaja)),
        ),
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
      request.url?.includes(`valinta-tulos-service/auth/sijoitteluntulos`) &&
      request.url?.includes('sijoitteluajo/latest/hakukohde')
    ) {
      return modifyResponse(response, SIJOITTELUN_TULOS_HAKUKOHTEELLE);
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
        `valintalaskentakoostepalvelu/resources/proxy/valintatulosservice/tilahakijalle/haku/`,
      )
    ) {
      return modifyResponse(response, VASTAANOTTOTILAT_HAKIJOILLE);
    } else if (
      request.url?.includes(
        'valintalaskentakoostepalvelu/resources/parametrit/',
      )
    ) {
      return modifyResponse(response, { koetulostentallennus: true });
    } else if (
      request.url?.includes(
        'valintaperusteet-service/resources/hakukohde/avaimet',
      )
    ) {
      return modifyResponse(response, KOKEET);
    } else if (
      request.url?.includes('valinnanvaihe?withValisijoitteluTieto=true')
    ) {
      return modifyResponse(response, VALINNANVAIHE);
    } else if (
      request.url?.includes('valintaryhma/onko-haulla-valintaryhmia')
    ) {
      return modifyResponse(response, true);
    } else if (
      request.url?.includes('valintaperusteet-service/resources/puu')
    ) {
      return modifyResponse(response, VALINTARYHMA_PUU);
    } else if (
      /valintaperusteet-service\/resources\/hakukohde\/\S+\/valintaryhma/.test(
        request.url ?? '',
      )
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
      request.method === 'POST' &&
      request.url?.includes('valinta-tulos-service/auth/lukuvuosimaksu/')
    ) {
      return modifyResponse(response, []);
    } else if (
      request.method === 'POST' &&
      request.url?.endsWith('valinta-tulos-service/auth/hyvaksymiskirje')
    ) {
      return modifyResponse(response, []);
    } else if (
      request.method === 'POST' &&
      request.url?.endsWith(
        'valinta-tulos-service/auth/valintaesitys/valintatapajono-yo/hyvaksytty',
      )
    ) {
      return modifyResponse(response, {});
    } else if (
      request.method === 'PATCH' &&
      request.url?.endsWith(
        'valinta-tulos-service/auth/valinnan-tulos/valintatapajono-yo',
      )
    ) {
      response.statusCode = 204;
      response.end();
    } else if (
      request.url?.includes(
        'valintalaskentakoostepalvelu/resources/pistesyotto/koostetutPistetiedot/haku',
      )
    ) {
      return modifyResponse(response, PISTETIEDOT);
    } else if (
      request.url?.includes(
        'valintalaskentakoostepalvelu/resources/dokumentit/',
      )
    ) {
      return modifyResponse(response, null);
    } else if (
      request.url?.includes(
        'valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/template/getHistory',
      )
    ) {
      const pohjat = [
        {
          name: 'OPH oletuspohja',
          templateReplacements: [
            { name: 'sisalto', defaultValue: 'Terve suuri aatelinen!' },
          ],
        },
      ];
      return modifyResponse(response, pohjat);
    } else if (
      request.url?.includes(
        '/valintalaskentakoostepalvelu/resources/proxy/viestintapalvelu/count/haku',
      )
    ) {
      return modifyResponse(response, KIRJEIDEN_MUODOSTUKSEN_TILANNE);
    } else if (
      request.url?.includes(
        'sijoittelu-service/resources/koostesijoittelu/status',
      )
    ) {
      return modifyResponse(response, {
        valmis: false,
        ohitettu: false,
        tekeillaan: false,
      });
    } else if (
      request.url?.includes(
        'sijoittelu-service/resources/koostesijoittelu/jatkuva',
      )
    ) {
      return modifyResponse(response, null);
    } else if (
      request.url?.includes(
        '/resources/proxy/valintatulosservice/myohastyneet/haku/',
      )
    ) {
      return modifyResponse(response, []);
    } else if (request.url?.includes('/valintatiedot-hakukohteittain')) {
      return modifyResponse(response, VALINTATIEDOT_HAKUKOHTEITTAIN);
    } else if (request.url?.endsWith('/sijoitteluajo/latest/perustiedot')) {
      response.statusCode = 404;
      return response.end();
    } else {
      console.log(
        '(Backend) mock not implemented',
        request.method,
        request.url,
      );
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
