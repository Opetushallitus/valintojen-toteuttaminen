import { SijoittelunTila } from './sijoittelu-types';
import { ValintakoeAvaimet } from './valintaperusteet-types';

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

export type JonoSijaModel = {
  jonosija: number;
  hakemusOid: string;
  hakijaOid: string;
  tuloksenTila: string;
  harkinnanvarainen: boolean;
  prioriteetti: number;
  jarjestyskriteerit: Array<Jarjestyskriteeri>;
};

export type LaskettuValintatapajonoModel = {
  oid: string;
  nimi: string;
  valintatapajonooid: string;
  prioriteetti: number;
  jonosijat: Array<JonoSijaModel>;
  valmisSijoiteltavaksi: boolean;
  siirretaanSijoitteluun: boolean;
};

export type LaskettuValinnanVaiheModel = {
  jarjestysnumero: number;
  valinnanvaiheoid: string;
  hakuOid: string;
  nimi: string;
  createdAt: number;
  valintatapajonot?: Array<LaskettuValintatapajonoModel>;
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

export enum ValintakoeOsallistuminenTulos {
  OSALLISTUI = 'OSALLISTUI',
  EI_OSALLISTUNUT = 'EI_OSALLISTUNUT',
  MERKITSEMATTA = 'MERKITSEMATTA',
  EI_VAADITA = 'EI_VAADITA',
  TOISESSA_HAKUTOIVEESSA = 'TOISESSA_HAKUTOIVEESSA',
  TOISELLA_HAKEMUKSELLA = 'TOISELLA_HAKEMUKSELLA',
  EI_KUTSUTTU = 'EI_KUTSUTTU',
}

export type ValintakokeenPisteet = {
  tunniste: string;
  arvo: string;
  osallistuminen: ValintakoeOsallistuminenTulos;
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
  valintakokeet: ValintakoeAvaimet[];
  hakemukset: HakemuksenPistetiedot[];
  lastModified?: Date;
};
