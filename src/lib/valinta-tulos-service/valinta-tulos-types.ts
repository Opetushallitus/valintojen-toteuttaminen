import {
  IlmoittautumisTila,
  SijoittelunTila,
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
  vastaanottotila: VastaanottoTila;
  valinnantila: SijoittelunTila;
  ilmoittautumistila: IlmoittautumisTila;
  julkaistavissa: boolean;
  ehdollisestiHyvaksyttavissa: boolean;
  ehdollisenHyvaksymisenEhtoKoodi?: string | null;
  ehdollisenHyvaksymisenEhtoFI?: string | null;
  ehdollisenHyvaksymisenEhtoSV?: string | null;
  ehdollisenHyvaksymisenEhtoEN?: string | null;
  hyvaksyttyVarasijalta: boolean;
  hyvaksyPeruuntunut: boolean;
};

export type HakemusChangeDetail = {
  field: string;
  from: string | boolean;
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
