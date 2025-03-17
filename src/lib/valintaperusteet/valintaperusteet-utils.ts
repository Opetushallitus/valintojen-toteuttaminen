import { isEmpty, last, prop } from 'remeda';
import { Valinnanvaihe } from './valintaperusteet-types';

/**
 * Tarkistaa, onko valintalaskenta käytössä Hakukohteen valinnanvaiheissa tai valintatapajonossa.
 * @param valinnanvaiheet Hakukohteen valinnanvaiheet valintaperusteista järjestyksessä.
 * @param jonoOid Valintatapajonon tunniste. Jos jonon id:tä ei ole annettu, tarkistetaan onko laskenta käytössä hakukohteessa.
 */
export const checkIsValintalaskentaUsed = (
  valinnanvaiheet: Array<Valinnanvaihe>,
  jonoOid?: string,
) => {
  const aktiivisetVaiheet = valinnanvaiheet.filter(prop('aktiivinen'));
  if (jonoOid) {
    const jono = aktiivisetVaiheet
      .flatMap((v) => v.jonot)
      .find((j) => j.oid === jonoOid);
    return Boolean(jono?.kaytetaanValintalaskentaa);
  } else {
    // Muiden valinnanvaiheiden tulokset jätetään huomiotta, jos viimeisessä aktiivisessa valinnanvaiheessa ei ole laskentaa
    const lastValinnanvaihe = last(aktiivisetVaiheet);
    return Boolean(
      !isEmpty(lastValinnanvaihe?.jonot ?? []) &&
        lastValinnanvaihe?.jonot.some((jono) => jono.kaytetaanValintalaskentaa),
    );
  }
};

/** Palauttaa valinnanvaiheet ja niiden jonot, jotka ei käytä valintalaskentaa.
 * @param valinnanvaiheet Hakukohteen valinnanvaiheet (valintaperusteista).
 */
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
