export type ValintatapajonoTulos = {
  nimi: string;
  oid: string;
  sijoittelunAloituspaikat: string;
  hyvaksytty: number;
  ehdollisestiHyvaksytty: number;
  harkinnanvaraisestiHyvaksytty: number;
  varasijoilla: number;
  vastaanottaneet: number;
  paikanPeruneet: number;
  pisteraja: number;
};

export enum SijoittelunTila {
  HYVAKSYTTY = 'HYVAKSYTTY',
  VARASIJALTA_HYVAKSYTTY = 'VARASIJALTA_HYVAKSYTTY',
  HARKINNANVARAISESTI_HYVAKSYTTY = 'HARKINNANVARAISESTI_HYVAKSYTTY',
  VARALLA = 'VARALLA',
  HYLATTY = 'HYLATTY',
  PERUUNTUNUT = 'PERUUNTUNUT',
  PERUNUT = 'PERUNUT',
  PERUUTETTU = 'PERUUTETTU',
}

export const SijoittelunTilaOrdinals: Record<string, number> = Object.keys(
  SijoittelunTila,
)
  .map((key, index) => ({ [key]: index }))
  .reduce((a, b) => ({ ...a, ...b }));

export type SijoittelunHakemus = {
  hakijaOid: string;
  hakemusOid: string;
  pisteet: number;
  tila: SijoittelunTila;
  valintatapajonoOid: string;
  hyvaksyttyHakijaryhmista: string[];
  varasijanNumero: number;
};

export type SijoitteluajonValintatapajono = {
  oid: string;
  nimi: string;
  hakemukset: SijoittelunHakemus[];
  prioriteetti: number;
};

export type SijoittelunHakijaryhmat = {
  oid: string;
  kiintio: number;
};

export type SijoitteluajonTulokset = {
  valintatapajonot: SijoitteluajonValintatapajono[];
  hakijaryhmat: SijoittelunHakijaryhmat[];
};

export type HenkilonValintaTulos = {
  tila: string;
  hakijaOid: string;
};
