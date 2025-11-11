import { TranslatedName } from '../localization/localization-types';
import { ValinnanTulosActorRef } from '../state/createValinnanTuloksetMachine';
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
  ehdollisestiVastaanottaneet: number;
  paikanPeruneet: number;
  pisteraja?: string;
};

export enum ValinnanTila {
  HYVAKSYTTY = 'HYVAKSYTTY',
  VARASIJALTA_HYVAKSYTTY = 'VARASIJALTA_HYVAKSYTTY',
  HARKINNANVARAISESTI_HYVAKSYTTY = 'HARKINNANVARAISESTI_HYVAKSYTTY',
  VARALLA = 'VARALLA',
  HYLATTY = 'HYLATTY',
  PERUUNTUNUT = 'PERUUNTUNUT',
  PERUNUT = 'PERUNUT',
  PERUUTETTU = 'PERUUTETTU',
}

const HYVAKSYTTY_TAI_PERUTTU_TILAT = new Set<ValinnanTila>([
  ValinnanTila.HYVAKSYTTY,
  ValinnanTila.VARASIJALTA_HYVAKSYTTY,
  ValinnanTila.HARKINNANVARAISESTI_HYVAKSYTTY,
  ValinnanTila.PERUNUT,
  ValinnanTila.PERUUTETTU,
]);

export const isHyvaksyttyTaiPeruttuTila = (tila?: ValinnanTila): boolean =>
  !!tila && HYVAKSYTTY_TAI_PERUTTU_TILAT.has(tila);

export const ValinnanTilaOrdinals: Record<string, number> = Object.keys(
  ValinnanTila,
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
  pisteet: string;
  tila: ValinnanTila;
  valintatapajonoOid: string;
  hyvaksyttyHakijaryhmista: Array<string>;
  varasijanNumero: number;
  hakijanNimi?: string;
};

export type SijoittelunHakemusValintatiedoilla = {
  hakemusOid: string;
  hakijaOid: string;
  henkilotunnus?: string | null;
  pisteet: string;
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
  hyvaksyPeruuntunut?: boolean;
  hyvaksymiskirjeLahetetty?: string;
  tilanKuvaukset?: TranslatedName;
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

export type SijoittelunTulosActorRef =
  ValinnanTulosActorRef<SijoittelunHakemusValintatiedoilla>;
