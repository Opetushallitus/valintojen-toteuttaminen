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

export type Hakemus = {
  oid: string;
  henkiloOid: string;
  etunimet: string;
  sukunimi: string;
  hakijanNimi: string;
  hakutoiveNumero: number;
  hakukelpoisuus: Hakukelpoisuus;
  maksuvelvollisuus: Maksuvelvollisuus;
  hakemuksenTila: HakemuksenTila;
};
