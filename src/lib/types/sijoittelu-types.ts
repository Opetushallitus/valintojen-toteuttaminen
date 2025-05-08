import { HakemuksenValinnanTulos } from '../valinta-tulos-service/valinta-tulos-types';

export type SijoittelunValintatapajonoTulos = {
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
  OTTANUT_VASTAAN_TOISEN_PAIKAN = 'OTTANUT_VASTAAN_TOISEN_PAIKAN',
}

export enum IlmoittautumisTila {
  EI_TEHTY = 'EI_TEHTY',
  LASNA_KOKO_LUKUVUOSI = 'LASNA_KOKO_LUKUVUOSI',
  POISSA_KOKO_LUKUVUOSI = 'POISSA_KOKO_LUKUVUOSI',
  EI_ILMOITTAUTUNUT = 'EI_ILMOITTAUTUNUT',
  LASNA_SYKSY = 'LASNA_SYKSY',
  POISSA_SYKSY = 'POISSA_SYKSY',
  LASNA = 'LASNA',
  POISSA = 'POISSA',
}

export type SijoittelunHakemus = {
  hakijaOid: string;
  hakemusOid: string;
  pisteet: number;
  tila: SijoittelunTila;
  valintatapajonoOid: string;
  hyvaksyttyHakijaryhmista: Array<string>;
  varasijanNumero: number;
  hakijanNimi?: string;
};

export type SijoittelunHakemusValintatiedoilla = {
  hakemusOid: string;
  hakijaOid: string;
  pisteet: number;
  valintatapajonoOid: string;
  hyvaksyttyHakijaryhmista: Array<string>;
  varasijanNumero: number;
  hakijanNimi: string;
  jonosija: number;
  tasasijaJonosija: number;
  hakutoive: number;
  sija?: number;
  hyvaksyttyVarasijalta: boolean;
  onkoMuuttunutViimeSijoittelussa: boolean;
  vastaanottoDeadlineMennyt?: boolean;
  vastaanottoDeadline?: string;
  hyvaksyttyHarkinnanvaraisesti?: boolean;
  hyvaksyPeruuntunut: boolean;
  hyvaksymiskirjeLahetetty?: string;
} & HakemuksenValinnanTulos;

export type SijoitteluajonValintatapajono = {
  oid: string;
  nimi: string;
  hakemukset: Array<SijoittelunHakemus>;
  prioriteetti: number;
  accepted?: string | null;
};

export type SijoitteluajonValintatapajonoValintatiedoilla = {
  oid: string;
  nimi: string;
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  prioriteetti: number;
  accepted?: string;
  aloituspaikat: number;
  alkuperaisetAloituspaikat?: number;
  tasasijasaanto: 'YLITAYTTO' | 'ARVONTA' | 'ALITAYTTO';
  varasijataytto: boolean;
  hasNegativePisteet: boolean;
};

export type SijoittelunHakijaryhmat = {
  oid: string;
  kiintio: number;
};

export type SijoitteluajonTulokset = {
  valintatapajonot: Array<SijoitteluajonValintatapajono>;
  hakijaryhmat: Array<SijoittelunHakijaryhmat>;
};

export type SijoitteluajonTuloksetValintatiedoilla = {
  sijoitteluajoId: string;
  valintatapajonot: Array<SijoitteluajonValintatapajonoValintatiedoilla>;
  lastModified: string;
};

export type HenkilonValintaTulos = {
  tila: string;
  hakijaOid: string;
};

export type AjastettuSijoittelu = {
  hakuOid: string;
  active: boolean;
  startTime: Date;
  frequency: string;
};
