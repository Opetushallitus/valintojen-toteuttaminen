import { SijoittelunHakemusValintatiedoilla } from '@/app/lib/types/sijoittelu-types';
import { ActorRefFrom } from 'xstate';
import { createSijoittelunTuloksetMachine } from './sijoittelun-tulokset-state';

export type SijoittelunTuloksetContext = {
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  changedHakemukset: Array<SijoittelunHakemusValintatiedoilla>;
  hakemuksetForMassUpdate?: Array<SijoittelunHakemusValintatiedoilla>;
  massChangeAmount?: number;
  publishAfterUpdate?: boolean;
};

export enum SijoittelunTuloksetState {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  UPDATE_COMPLETED = 'UPDATE_COMPLETED',
  PUBLISHING = 'PUBLISHING',
}

export enum SijoittelunTuloksetEventType {
  UPDATE = 'UPDATE',
  MASS_UPDATE = 'MASS_UPDATE',
  MASS_CHANGE = 'MASS_CHANGE',
  CHANGE = 'CHANGE',
  PUBLISH = 'PUBLISH',
}

export type SijoittelunTulosUpdateEvent = {
  type: SijoittelunTuloksetEventType.UPDATE;
};

/**
 * Massatallennus parametrina annetuilla tiedoilla. Ei käytetä tallennuksessa changedHakemukset-arvoja.
 * */
export type SijoittelunTulosMassUpdateEvent = {
  type: SijoittelunTuloksetEventType.MASS_UPDATE;
} & HakemuksetStateChangeParams;

export type SijoittelunTulosMassChangeEvent = {
  type: SijoittelunTuloksetEventType.MASS_CHANGE;
} & HakemuksetStateChangeParams;

export type SijoittelunTulosEditableFields = Partial<
  Pick<
    SijoittelunHakemusValintatiedoilla,
    | 'julkaistavissa'
    | 'ehdollisestiHyvaksyttavissa'
    | 'ehdollisenHyvaksymisenEhtoKoodi'
    | 'ehdollisenHyvaksymisenEhtoFI'
    | 'ehdollisenHyvaksymisenEhtoSV'
    | 'ehdollisenHyvaksymisenEhtoEN'
    | 'hyvaksyttyVarasijalta'
    | 'vastaanottotila'
    | 'ilmoittautumisTila'
    | 'maksuntila'
  >
>;

export type HakemuksetStateChangeParams = Pick<
  SijoittelunTulosEditableFields,
  'vastaanottotila' | 'ilmoittautumisTila'
> & {
  hakemusOids: Set<string>;
};

export type SijoittelunTulosChangeParams = SijoittelunTulosEditableFields & {
  hakemusOid: string;
};

export type SijoittelunTulosChangeEvent = {
  type: SijoittelunTuloksetEventType.CHANGE;
} & SijoittelunTulosChangeParams;

export type SijoittelunTulosPublishEvent = {
  type: SijoittelunTuloksetEventType.PUBLISH;
};

export type SijoittelunTuloksetEvents =
  | SijoittelunTulosUpdateEvent
  | SijoittelunTulosChangeEvent
  | SijoittelunTulosMassChangeEvent
  | SijoittelunTulosPublishEvent
  | SijoittelunTulosMassUpdateEvent;

export type SijoittelunTulosActorRef = ActorRefFrom<
  ReturnType<typeof createSijoittelunTuloksetMachine>
>;
