import { MaksunTila } from './ataru-types';

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
  ilmoittautumisTila: IlmoittautumisTila;
  vastaanottotila: VastaanottoTila;
  maksuntila?: MaksunTila;
  ehdollisestiHyvaksyttavissa: boolean;
  hyvaksyttyVarasijalta: boolean;
  onkoMuuttunutViimeSijoittelussa: boolean;
  ehdollisenHyvaksymisenEhtoKoodi?: string;
  ehdollisenHyvaksymisenEhtoFI?: string;
  ehdollisenHyvaksymisenEhtoSV?: string;
  ehdollisenHyvaksymisenEhtoEN?: string;
  vastaanottoDeadlineMennyt?: boolean;
  vastaanottoDeadline?: string;
  naytetaanVastaanottoTieto: boolean;
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
  alkuperaisetAloituspaikat?: number;
  tasasijasaanto: 'YLITAYTTO' | 'ARVONtA' | 'ALITAYTTO';
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
