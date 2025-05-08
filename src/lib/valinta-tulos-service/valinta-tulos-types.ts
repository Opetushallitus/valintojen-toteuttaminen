import { MaksunTila } from '../ataru/ataru-types';
import {
  IlmoittautumisTila,
  ValinnanTila,
  VastaanottoTila,
} from '../types/sijoittelu-types';

export type ValinnanTulosUpdateErrorResult = {
  message: string;
  hakemusOid: string;
  valintatapajonoOid: string;
  status: number;
};

export type ValinnanTulosModel = {
  hakukohdeOid: string;
  valintatapajonoOid: string;
  hakemusOid: string;
  henkiloOid: string;
  valinnantila: ValinnanTila;
  vastaanottotila: VastaanottoTila;
  ilmoittautumistila: IlmoittautumisTila;
  julkaistavissa: boolean;
  ehdollisestiHyvaksyttavissa: boolean;
  ehdollisenHyvaksymisenEhtoKoodi?: string;
  ehdollisenHyvaksymisenEhtoFI?: string;
  ehdollisenHyvaksymisenEhtoSV?: string;
  ehdollisenHyvaksymisenEhtoEN?: string;
  valinnantilanKuvauksenTekstiFI?: string;
  valinnantilanKuvauksenTekstiSV?: string;
  valinnantilanKuvauksenTekstiEN?: string;
  hyvaksyttyVarasijalta: boolean;
  hyvaksyPeruuntunut: boolean;
  vastaanottoDeadline?: string;
  vastaanottoDeadlineMennyt?: boolean;
};

export type HakemusChangeDetail = {
  field: string;
  from?: string | boolean;
  to: string | boolean;
};

export type HakemusChangeEvent = {
  rowKey: string;
  changeTimeUnformatted: string;
  changeTime: string;
  changes: Array<HakemusChangeDetail>;
};

export type HakijanVastaanottoTila = {
  valintatapaJonoOid: string;
  vastaanottotila: VastaanottoTila;
  hakemusOid: string;
};

export type SijoitteluajonTuloksetResponseData = {
  valintatapajonot: Array<{
    oid: string;
    nimi: string;
    prioriteetti: number;
    aloituspaikat: number;
    alkuperaisetAloituspaikat?: number;
    tasasijasaanto: 'YLITAYTTO' | 'ARVONTA' | 'ALITAYTTO';
    eiVarasijatayttoa: boolean;
    hakemukset: Array<{
      hakijaOid: string;
      hakemusOid: string;
      pisteet: number;
      tila: ValinnanTila;
      valintatapajonoOid: string;
      hyvaksyttyHakijaryhmista: Array<string>;
      varasijanNumero: number;
      jonosija: number;
      tasasijaJonosija: number;
      prioriteetti: number;
      onkoMuuttunutViimeSijoittelussa: boolean;
      siirtynytToisestaValintatapajonosta: boolean;
    }>;
  }>;
  sijoitteluajoId: string;
  hakijaryhmat: Array<{ oid: string; kiintio: number }>;
};

export type SijoitteluajonTuloksetWithValintaEsitysResponseData = {
  valintatulokset: Array<{
    valintatapajonoOid: string;
    hakemusOid: string;
    henkiloOid: string;
    pisteet: number;
    valinnantila: 'VARALLA' | 'HYLATTY' | 'HYVAKSYTTY';
    ehdollisestiHyvaksyttavissa: boolean;
    julkaistavissa: boolean;
    hyvaksyttyVarasijalta: boolean;
    hyvaksyPeruuntunut: boolean;
    hyvaksyttyHakijaryhmista: Array<string>;
    varasijanNumero: number;
    jonosija: number;
    tasasijaJonosija: number;
    prioriteetti: number;
    vastaanottotila: VastaanottoTila;
    ilmoittautumistila: IlmoittautumisTila;
    ehdollisenHyvaksymisenEhtoKoodi?: string;
    ehdollisenHyvaksymisenEhtoFI?: string;
    ehdollisenHyvaksymisenEhtoSV?: string;
    ehdollisenHyvaksymisenEhtoEN?: string;
    valinnantilanKuvauksenTekstiFI?: string;
    valinnantilanKuvauksenTekstiSV?: string;
    valinnantilanKuvauksenTekstiEN?: string;
    vastaanottoDeadlineMennyt?: boolean;
    vastaanottoDeadline?: string;
    hyvaksyttyHarkinnanvaraisesti: boolean;
  }>;
  valintaesitys: Array<{
    hakukohdeOid: string;
    valintatapajonoOid: string;
    hyvaksytty?: string;
  }>;
  lastModified: string;
  sijoittelunTulokset: Omit<SijoitteluajonTuloksetResponseData, 'hakijaryhmat'>;
  kirjeLahetetty: Array<{
    henkiloOid: string;
    kirjeLahetetty: string;
  }>;
  lukuvuosimaksut: Array<{ personOid: string; maksuntila: MaksunTila }>;
};

export type SijoittelunTulosBasicInfo = {
  startDate: Date;
  endDate: Date;
};

export type HakemuksenValinnanTulos = {
  hakemusOid: string;
  hakijaOid: string;
  hakijanNimi: string;
  valintatapajonoOid?: string;
  valinnanTila?: ValinnanTila;
  valinnanTilanKuvausFI?: string;
  valinnanTilanKuvausSV?: string;
  valinnanTilanKuvausEN?: string;
  ehdollisestiHyvaksyttavissa?: boolean;
  hyvaksyttyVarasijalta?: boolean;
  ehdollisenHyvaksymisenEhtoKoodi?: string;
  ehdollisenHyvaksymisenEhtoFI?: string;
  ehdollisenHyvaksymisenEhtoSV?: string;
  ehdollisenHyvaksymisenEhtoEN?: string;
  vastaanottoTila?: VastaanottoTila;
  ilmoittautumisTila?: IlmoittautumisTila;
  julkaistavissa?: boolean;
  hyvaksyPeruuntunut?: boolean;
  maksunTila?: string;
  siirtynytToisestaValintatapajonosta?: boolean;
  vastaanottoDeadline?: string;
  vastaanottoDeadlineMennyt?: boolean;
};
