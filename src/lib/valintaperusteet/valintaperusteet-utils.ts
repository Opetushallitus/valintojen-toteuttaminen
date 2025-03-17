import { last } from 'remeda';
import { Valinnanvaihe } from './valintaperusteet-types';

export const checkIsValintalaskentaUsed = (
  valinnanvaiheet: Array<Valinnanvaihe>,
  jonoOid?: string,
) => {
  if (jonoOid) {
    const jono = valinnanvaiheet
      .flatMap((v) => v.jonot)
      .find((j) => j.oid === jonoOid);
    return jono?.kaytetaanValintalaskentaa || false;
  } else {
    const lastValinnanvaihe = last(valinnanvaiheet);
    return (
      lastValinnanvaihe?.jonot.some((jono) => jono.kaytetaanValintalaskentaa) ||
      false
    );
  }
};
