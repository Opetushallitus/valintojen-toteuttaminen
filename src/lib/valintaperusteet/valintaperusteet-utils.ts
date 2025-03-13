import { isEmpty, last } from 'remeda';
import { Valinnanvaihe } from './valintaperusteet-types';

export const checkIsValintalaskentaUsed = (
  valinnanvaiheet: Array<Valinnanvaihe>,
  jonoOid?: string,
) => {
  if (jonoOid) {
    const jono = valinnanvaiheet
      .filter((v) => v.aktiivinen)
      .flatMap((v) => v.jonot)
      .find((j) => j.oid === jonoOid);
    return jono?.kaytetaanValintalaskentaa || false;
  } else {
    // valintaperusteet palauttaa valinnanvaiheet järjestettynä, ja viimeinen valinnanvaihe määrittää onko laskenta käytössä
    const lastValinnanvaihe = last(valinnanvaiheet);
    return Boolean(
      lastValinnanvaihe?.aktiivinen &&
        !isEmpty(lastValinnanvaihe.jonot) &&
        lastValinnanvaihe?.jonot.some((jono) => jono.kaytetaanValintalaskentaa),
    );
  }
};

export const selectLaskennattomatValinnanvaiheet = (
  valinnanvaiheet: Array<Valinnanvaihe>,
) => {
  return valinnanvaiheet.reduce((acc, v) => {
    if (v.aktiivinen) {
      const jonot = v.jonot.filter((j) => !j.kaytetaanValintalaskentaa);
      if (jonot.length !== 0) {
        return [...acc, { ...v, jonot }];
      }
    }
    return acc;
  }, [] as Array<Valinnanvaihe>);
};
