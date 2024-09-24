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

export enum VastaanottoTila {
  KESKEN = 'KESKEN',
  EHDOLLISESTI_VASTAANOTTANUT = 'EHDOLLISESTI_VASTAANOTTANUT', //kk only?
  VASTAANOTTANUT_SITOVASTI = 'VASTAANOTTANUT_SITOVASTI',
  EI_VASTAANOTETTU_MAARA_AIKANA = 'EI_VASTAANOTETTU_MAARA_AIKANA',
  PERUNUT = 'PERUNUT',
  PERUUTETTU = 'PERUUTETTU',
  OTTANUT_VASTAAN_TOISEN_PAIKAN = 'OTTANUT_VASTAAN_TOISEN_PAIKAN', //kk only?
}

export type SijoittelunHakemus = {
  hakijaOid: string;
  hakemusOid: string;
  pisteet: number;
  tila: SijoittelunTila;
  valintatapajonoOid: string;
  hyvaksyttyHakijaryhmista: string[];
  varasijanNumero: number;
  hakijanNimi?: string;
};

export type SijoittelunHakemusEnriched = {
  hakijaOid: string;
  hakemusOid: string;
  pisteet: number;
  tila: SijoittelunTila;
  valintatapajonoOid: string;
  hyvaksyttyHakijaryhmista: string[];
  varasijanNumero: number;
  hakijanNimi: string;
  jonosija: number;
  tasasijaJonosija: number;
  hakutoive: number;
  sija?: number;
  julkaistavissa: boolean;
  ilmoittautumisTila: 'EI_TEHTY';
  vastaanottotila: 'KESKEN';
};

export type SijoitteluajonValintatapajono = {
  oid: string;
  nimi: string;
  hakemukset: SijoittelunHakemus[];
  prioriteetti: number;
  accepted?: string | null;
};

export type SijoitteluajonValintatapajonoEnriched = {
  oid: string;
  nimi: string;
  hakemukset: SijoittelunHakemusEnriched[];
  prioriteetti: number;
  accepted?: string;
  aloituspaikat: number;
  tasasijasaanto: 'YLITAYTTO'; //TODO muut
  varasijataytto: boolean;
};

export type SijoittelunHakijaryhmat = {
  oid: string;
  kiintio: number;
};

export type SijoitteluajonTulokset = {
  valintatapajonot: SijoitteluajonValintatapajono[];
  hakijaryhmat: SijoittelunHakijaryhmat[];
};

export type SijoitteluajonTuloksetEnriched = {
  valintatapajonot: SijoitteluajonValintatapajonoEnriched[];
  lastModified: string;
};

export type HenkilonValintaTulos = {
  tila: string;
  hakijaOid: string;
};
