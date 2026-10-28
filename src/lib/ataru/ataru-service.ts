import {
  HakemuksenTila,
  Hakemus,
  Hakukelpoisuus,
  Maksuvelvollisuus,
} from './ataru-types';
import { client } from '../http-client';
import { Language } from '../localization/localization-types';
import { byLocaleCompare } from '../localization/translation-utils';
import { KoutaOidParams } from '../kouta/kouta-types';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from '../configuration/configuration-utils';

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

type AtaruHakutoive = {
  hakukohdeOid: string;
  eligibilityState?: string;
  processingState?: string;
  paymentObligation?: string;
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
  hakuOid: string;
  henkilotunnus: string;
  lahiosoite: string;
  postinumero: string;
  hakutoiveet: Array<AtaruHakutoive>;
};

export type GetHakemuksetParams = KoutaOidParams & {
  hakemusOids?: Array<string>;
  name?: string;
  henkiloOid?: string;
  henkilotunnus?: string;
};

export async function getAtaruHakemukset({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
  name,
  henkiloOid,
  henkilotunnus,
}: GetHakijatParams) {
  const configuration = getConfiguration();
  const url = new URL(configuration.routes.ataru.hakemuksetUrl);
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
  if (henkiloOid) {
    url.searchParams.append('henkiloOid', henkiloOid);
  }
  if (name) {
    url.searchParams.append('name', name);
  }
  if (henkilotunnus) {
    url.searchParams.append('henkilotunnus', henkilotunnus);
  }

  const response = await client.get<Array<AtaruHakemus>>(url);

  return response.data;
}

export const parseHakijaTiedot = (hakemus: AtaruHakemus) => {
  return {
    hakemusOid: hakemus.oid,
    hakuOid: hakemus.hakuOid,
    hakijaOid: hakemus.personOid,
    etunimet: hakemus.etunimet,
    sukunimi: hakemus.sukunimi,
    hakijanNimi: `${hakemus.sukunimi} ${hakemus.etunimet}`,
    asiointikieliKoodi: hakemus.asiointiKieli.kieliKoodi as Language,
    henkilotunnus: hakemus.henkilotunnus,
    lahiosoite: hakemus.lahiosoite,
    postinumero: hakemus.postinumero,
  };
};

const parseHakutoiveTiedot = (
  hakukohdeOid: string,
  hakutoiveet: Array<AtaruHakutoive>,
) => {
  let hakutoiveNumero = 0;
  const hakutoive = hakutoiveet.find((value, index) => {
    if (value.hakukohdeOid === hakukohdeOid) {
      hakutoiveNumero = index + 1;
      return true;
    }
    return false;
  });

  return {
    hakutoiveNumero,
    tila: getTila(hakutoive),
    maksuvelvollisuus: getMaksuvelvollisuus(hakutoive),
    hakukelpoisuus: getHakukelpoisuus(hakutoive),
  };
};

export type GetHakijatParams = Partial<GetHakemuksetParams>;

export const getHakijat = async (params: GetHakijatParams) => {
  const ataruHakemukset = await getAtaruHakemukset(params);
  return ataruHakemukset
    .map(parseHakijaTiedot)
    .sort(byLocaleCompare('hakijanNimi'));
};

export async function getHakemukset({
  hakuOid,
  hakukohdeOid,
  hakemusOids,
  henkiloOid,
  name,
  henkilotunnus,
}: GetHakemuksetParams): Promise<Array<Hakemus>> {
  const data = await getAtaruHakemukset({
    hakuOid,
    hakukohdeOid,
    hakemusOids,
    henkiloOid,
    name,
    henkilotunnus,
  });

  return data
    .map((h) => {
      return {
        ...parseHakijaTiedot(h),
        ...parseHakutoiveTiedot(hakukohdeOid, h.hakutoiveet),
      };
    })
    .sort(byLocaleCompare('hakijanNimi'));
}

const LINK_TO_HAKU = 'kouta/haku/';

export const buildLinkToApplication = (hakemusOid: string) => {
  const config = getConfiguration();
  return getConfigUrl(config.routes.ataru.editoriHakemusLink, { hakemusOid });
};

export const buildLinkToHaku = (hakuOid: string) => LINK_TO_HAKU + hakuOid;
