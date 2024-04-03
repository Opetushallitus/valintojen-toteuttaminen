import {createServer} from 'http';
import HAUT from './fixtures/haut.json';
import HAKUKOHTEET from './fixtures/hakukohteet.json';
import HAKUTAPA_CODES from './fixtures/hakutapa.json';

const port = 3104;

export default async function playwrightSetup() {
  const server = await createServer(async (request, response) => {
    if (request.url.includes(`kouta-internal/haku/search`)) {
      response.write(JSON.stringify(HAUT));
      response.end();
      return;
    } else if (request.url.includes(`koodisto-service/rest/codeelement/codes/hakutapa`)) {
      response.write(JSON.stringify(HAKUTAPA_CODES));
      response.end();
      return;
    } else if (request.url.includes('kouta-internal/hakukohde/search')) {
      response.write(JSON.stringify(HAKUKOHTEET));
      response.end();
      return;
    } else if (request.url.includes(`kouta-internal/haku/`)) {
      const hakuId = request.url.split('haku\/')[1];
      const haku = HAUT.find((hakuData) => hakuData.oid === hakuId);
      response.write(JSON.stringify(haku));
      response.end();
      return;
    } else {
      console.log('(Backend) mock not implementeded', request.url);
      return;
    }
  });

  server.listen(port, (error) => {
      console.error(error);
  });
}
