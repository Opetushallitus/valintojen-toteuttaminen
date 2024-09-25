import { Language } from '../localization/localization-types';

export enum Maksuvelvollisuus {
  MAKSUVELVOLLINEN = 'hakemus.maksuvelvollisuus.maksuvelvollinen',
  EI_MAKSUVELVOLLINEN = 'hakemus.maksuvelvollisuus.eimaksuvelvollinen',
  TARKASTAMATTA = 'hakemus.tarkastamatta',
}

export enum HakemuksenTila {
  AKTIIVINEN = 'hakemus.tila.aktiivinen',
  KESKEN = 'hakemus.tila.kesken',
}

export enum Hakukelpoisuus {
  HAKUKELPOINEN = 'hakemus.hakukelpoisuus.hakukelpoinen',
  HAKUKELVOTON = 'hakemus.hakukelpoisuus.hakukelvoton',
  EHDOLLINEN = 'hakemus.hakukelpoisuus.ehdollinen',
  TARKASTAMATTA = 'hakemus.tarkastamatta',
}

export type Hakemus = HakijaInfo & {
  hakutoiveNumero: number;
  hakukelpoisuus: Hakukelpoisuus;
  maksuvelvollisuus: Maksuvelvollisuus;
  tila: HakemuksenTila;
};

export type HakijaInfo = {
  hakemusOid: string;
  hakijaOid: string;
  etunimet: string;
  sukunimi: string;
  hakijanNimi: string;
  asiointikieliKoodi: Language;
};

export enum MaksunTila {
  MAKSAMATTA = 'MAKSAMATTA',
  MAKSETTU = 'MAKSETTU',
  VAPAUTETTU = 'VAPAUTETTU',
}
