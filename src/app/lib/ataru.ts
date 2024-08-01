import {
  HakemuksenTila,
  Hakemus,
  Hakukelpoisuus,
  Maksuvelvollisuus,
} from './types/ataru-types';
import { configuration } from './configuration';
import { client } from './http-client';

const getMaksuvelvollisuus = (toive?: {
  hakukohdeOid: string;
  eligibilityState?: string;
  processingState?: string;
  paymentObligation?: string;
}): Maksuvelvollisuus => {
  switch (toive?.paymentObligation) {
    case 'obligated':
      return Maksuvelvollisuus.MAKSUVELVOLLINEN;
    case 'not-obligated':
      return Maksuvelvollisuus.EI_MAKSUVELVOLLINEN;
    default:
      return Maksuvelvollisuus.TARKASTAMATTA;
  }
};

const getHakukelpoisuus = (toive?: {
  hakukohdeOid: string;
  eligibilityState?: string;
  processingState?: string;
  paymentObligation?: string;
}): Hakukelpoisuus => {
  switch (toive?.eligibilityState) {
    case 'eligible':
      return Hakukelpoisuus.HAKUKELPOINEN;
    case 'uneligible':
      return Hakukelpoisuus.HAKUKELVOTON;
    case 'conditionally-eligible':
      return Hakukelpoisuus.EHDOLLINEN;
    default:
      return Hakukelpoisuus.TARKASTAMATTA;
  }
};

const getTila = (toive?: {
  hakukohdeOid: string;
  eligibilityState?: string;
  processingState?: string;
  paymentObligation?: string;
}): HakemuksenTila => {
  return toive?.processingState === 'information_request'
    ? HakemuksenTila.KESKEN
    : HakemuksenTila.AKTIIVINEN;
};

export async function getHakemukset(
  hakuOid: string,
  hakukohdeOid: string,
): Promise<Hakemus[]> {
  const url = `${configuration.hakemuksetUrl}?hakuOid=${hakuOid}&hakukohdeOid=${hakukohdeOid}`;
  const response = await client.get(url);
  return response.data.map(
    (h: {
      etunimet: string;
      sukunimi: string;
      personOid: string;
      oid: string;
      hakutoiveet: [
        {
          hakukohdeOid: string;
          eligibilityState?: string;
          processingState?: string;
          paymentObligation?: string;
        },
      ];
    }) => {
      let hakutoiveNumero = 0;
      const hakutoive = h.hakutoiveet.find((value, index) => {
        if (value.hakukohdeOid === hakukohdeOid) {
          hakutoiveNumero = index + 1;
          return true;
        }
        return false;
      });
      const fullName = `${h.sukunimi} ${h.etunimet}`;
      return {
        oid: h.oid,
        henkiloOid: h.personOid,
        etunimet: h.etunimet,
        sukunimi: h.sukunimi,
        hakijanNimi: fullName,
        hakutoiveNumero,
        tila: getTila(hakutoive),
        maksuvelvollisuus: getMaksuvelvollisuus(hakutoive),
        hakukelpoisuus: getHakukelpoisuus(hakutoive),
      };
    },
  );
}
