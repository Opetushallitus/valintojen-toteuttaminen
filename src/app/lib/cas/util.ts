import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';

export async function parseXml(xmlString: string) {
  return new Promise((resolve, reject) => {
    parseString(xmlString, { explicitRoot: false, tagNameProcessors: [stripPrefix]},
      (error, result) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        resolve(result);
      });
  });
}