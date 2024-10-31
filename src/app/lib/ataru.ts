import {
  HakemuksenTila,
  Hakemus,
  Hakukelpoisuus,
  Maksuvelvollisuus,
} from './types/ataru-types';
import { configuration } from './configuration';
import { client } from './http-client';
import { Language } from './localization/localization-types';

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

type AtaruHakemus = {
  asiointiKieli: {
    kieliKoodi: string;
    kieliTyyppi: string;
  };
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
};

type GetHakemuksetParams = {
  hakuOid?: string;
  hakukohdeOid?: string;
  hakemusOids?: Array<string>;
};

async function getAtaruHakemukset({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
}: GetHakemuksetParams) {
  const url = new URL(configuration.hakemuksetUrl);
  if (hakuOid) {
    url.searchParams.append('hakuOid', hakuOid);
  }
  if (hakukohdeOid) {
    url.searchParams.append('hakukohdeOid', hakukohdeOid);
  }
  if (hakemusOids) {
    for (const hakemusOid of hakemusOids) {
      url.searchParams.append('hakemusOids', hakemusOid);
    }
  }

  const response = await client.get<Array<AtaruHakemus>>(url);

  return response.data;
}

const parseHakijaTiedot = (hakemus: AtaruHakemus) => {
  return {
    hakemusOid: hakemus.oid,
    hakijaOid: hakemus.personOid,
    etunimet: hakemus.etunimet,
    sukunimi: hakemus.sukunimi,
    hakijanNimi: `${hakemus.sukunimi} ${hakemus.etunimet}`,
    asiointikieliKoodi: hakemus.asiointiKieli.kieliKoodi as Language,
  };
};

export const getHakijat = async (params: GetHakemuksetParams) => {
  const ataruHakemukset = await getAtaruHakemukset(params);
  return ataruHakemukset.map(parseHakijaTiedot);
};

export async function getHakemukset({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
}: GetHakemuksetParams): Promise<Hakemus[]> {
  const data = await getAtaruHakemukset({ hakuOid, hakukohdeOid, hakemusOids });

  return data.map((h) => {
    let hakutoiveNumero = 0;
    const hakutoive = h.hakutoiveet.find((value, index) => {
      if (value.hakukohdeOid === hakukohdeOid) {
        hakutoiveNumero = index + 1;
        return true;
      }
      return false;
    });
    return {
      ...parseHakijaTiedot(h),
      hakutoiveNumero,
      tila: getTila(hakutoive),
      maksuvelvollisuus: getMaksuvelvollisuus(hakutoive),
      hakukelpoisuus: getHakukelpoisuus(hakutoive),
    };
  });
}

const LINK_TO_APPLICATION = 'lomake-editori/applications/search?term=';

export const buildLinkToApplication = (hakemusOid: string) =>
  LINK_TO_APPLICATION + hakemusOid;
