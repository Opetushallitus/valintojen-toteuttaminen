import { SijoittelunTila } from './sijoittelu-types';
import { Valintakoe } from './valintaperusteet-types';

export type JarjestyskriteeriTila = 'HYLATTY' | 'HYVAKSYTTAVISSA';

export type HakijaryhmanHakija = {
  hakijanNimi: string;
  kuuluuHakijaryhmaan: boolean;
  hakemusOid: string;
  hakijaOid: string;
  hyvaksyttyHakijaryhmasta: boolean;
  sijoittelunTila?: SijoittelunTila;
  vastaanottoTila?: string;
  pisteet: number;
  jononNimi?: string;
  varasijanNumero?: number;
};

export type HakukohteenHakijaryhma = {
  nimi: string;
  oid: string;
  prioriteetti: number;
  kiintio: number;
  hakijat: HakijaryhmanHakija[];
};

export type Jarjestyskriteeri = {
  arvo: number;
  tila: string;
  prioriteetti: number;
  nimi: string;
  kuvaus?: {
    FI?: string;
    SV?: string;
    EN?: string;
  };
};

export type JonoSija = {
  jonosija: number;
  hakemusOid: string;
  hakijaOid: string;
  tuloksenTila: string;
  harkinnanvarainen: boolean;
  prioriteetti: number;
  jarjestyskriteerit: Array<Jarjestyskriteeri>;
};

export type LaskettuValintatapajono = {
  oid: string;
  nimi: string;
  valintatapajonooid: string;
  prioriteetti: number;
  jonosijat: Array<JonoSija>;
  valmisSijoiteltavaksi: boolean;
  siirretaanSijoitteluun: boolean;
};

export type LaskettuValinnanVaihe = {
  jarjestysnumero: number;
  valinnanvaiheoid: string;
  hakuOid: string;
  nimi: string;
  createdAt: number;
  valintatapajonot?: Array<LaskettuValintatapajono>;
};

export type SeurantaTiedot = {
  tila: 'VALMIS' | 'MENEILLAAN';
  hakukohteitaYhteensa: number;
  hakukohteitaValmiina: number;
  hakukohteitaKeskeytetty: number;
};

export type LaskentaStart = {
  startedNewLaskenta: boolean;
  loadingUrl: string;
};

export type LaskentaErrorSummary = {
  hakukohdeOid: string;
  notifications: string[] | undefined;
};

export enum ValintakoeOsallistuminen {
  OSALLISTUI = 'OSALLISTUI',
  EI_OSALLISTUNUT = 'EI_OSALLISTUNUT',
  MERKITSEMATTA = 'MERKITSEMATTA',
  EI_VAADITA = 'EI_VAADITA',
}

export type ValintakokeenPisteet = {
  tunniste: string;
  arvo: string;
  osallistuminen: ValintakoeOsallistuminen;
  osallistuminenTunniste: string;
};

export type HakemuksenPistetiedot = {
  hakijanNimi: string;
  hakemusOid: string;
  hakijaOid: string;
  valintakokeenPisteet: ValintakokeenPisteet[];
  etunimet: string;
  sukunimi: string;
};

export type HakukohteenPistetiedot = {
  valintakokeet: Valintakoe[];
  hakemukset: HakemuksenPistetiedot[];
  lastModified?: Date;
};
