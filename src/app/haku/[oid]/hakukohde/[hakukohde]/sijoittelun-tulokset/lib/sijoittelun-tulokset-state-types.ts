import { MaksunTila } from '@/app/lib/types/ataru-types';
import {
  IlmoittautumisTila,
  SijoittelunHakemusValintatiedoilla,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { ActorRefFrom } from 'xstate';
import { createSijoittelunTuloksetMachine } from './sijoittelun-tulokset-state';

export type SijoittelunTuloksetContext = {
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  changedHakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  hakemuksetForUpdate?: Array<SijoittelunHakemusValintatiedoilla>;
  massChangeAmount?: number;
};

export enum SijoittelunTuloksetState {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  PUBLISHING = 'PUBLISHING',
  UPDATING_AND_THEN_PUBLISH = 'UPDATING_AND_THEN_PUBLISH',
  PUBLISHED = 'PUBLISHED',
}

export enum SijoittelunTuloksetEventType {
  UPDATE = 'UPDATE',
  MASS_UPDATE = 'MASS_UPDATE',
  CHANGE_HAKEMUKSET_STATES = 'CHANGE_HAKEMUKSET_STATES',
  ADD_CHANGED_HAKEMUS = 'ADD_CHANGED_HAKEMUS',
  PUBLISH = 'PUBLISH',
}

export type SijoittelunTulosUpdateEvent = {
  type: SijoittelunTuloksetEventType.UPDATE;
};

export type HakemuksetStateChangeParams = {
  hakemusOids: Set<string>;
  vastaanottoTila?: VastaanottoTila;
  ilmoittautumisTila?: IlmoittautumisTila;
};

/**
 * Massatallennus parametrina annetuilla tiedoilla. Ei käytetä tallennuksessa changedHakemukset-arvoja.
 * */
export type SijoittelunTulosMassUpdateEvent = {
  type: SijoittelunTuloksetEventType.MASS_UPDATE;
} & HakemuksetStateChangeParams;

export type SijottelunTulosMassChangeEvent = {
  type: SijoittelunTuloksetEventType.CHANGE_HAKEMUKSET_STATES;
} & HakemuksetStateChangeParams;

export type SijoittelunTulosChangeParams = {
  hakemusOid: string;
  julkaistavissa?: boolean;
  ehdollisestiHyvaksyttavissa?: boolean;
  ehdollisuudenSyy?: string;
  ehdollisuudenSyyKieli?: { fi?: string; en?: string; sv?: string };
  vastaanottotila?: VastaanottoTila;
  ilmoittautumisTila?: IlmoittautumisTila;
  maksunTila?: MaksunTila;
  hyvaksyttyVarasijalta?: boolean;
};

export type SijoittelunTulosChangeEvent = {
  type: SijoittelunTuloksetEventType.ADD_CHANGED_HAKEMUS;
} & SijoittelunTulosChangeParams;

export type SijoittelunTulosPublishEvent = {
  type: SijoittelunTuloksetEventType.PUBLISH;
};

export type SijoittelunTuloksetEvents =
  | SijoittelunTulosUpdateEvent
  | SijoittelunTulosChangeEvent
  | SijottelunTulosMassChangeEvent
  | SijoittelunTulosPublishEvent
  | SijoittelunTulosMassUpdateEvent;

export type SijoittelunTulosActorRef = ActorRefFrom<
  ReturnType<typeof createSijoittelunTuloksetMachine>
>;
