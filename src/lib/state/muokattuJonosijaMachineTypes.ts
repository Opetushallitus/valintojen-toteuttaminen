import { LaskennanJonosijaTulos } from '@/hooks/useEditableValintalaskennanTulokset';
import { JarjestyskriteeriParams } from '../types/jarjestyskriteeri-types';

export enum MuokattuJonosijaEventTypes {
  ADD = 'ADD',
  SAVE = 'SAVE',
  DELETE = 'DELETE',
}

export enum MuokattuJonosijaState {
  IDLE = 'IDLE',
  SAVING = 'SAVING',
  DELETING = 'DELETING',
}

export type MuokattuJonosijaChangeEvent = {
  type: MuokattuJonosijaEventTypes.ADD;
} & JarjestyskriteeriParams;

export type MuokattuJonosijaSaveEvent = {
  type: MuokattuJonosijaEventTypes.SAVE;
};

export type MuokattuJonosijaDeleteEvent = {
  type: MuokattuJonosijaEventTypes.DELETE;
} & { jarjestyskriteeriPrioriteetti: number };

export type MuokattuJonosijaContext = {
  valintatapajonoOid: string;
  jonosija: LaskennanJonosijaTulos;
  changedKriteerit: Array<JarjestyskriteeriParams>;
};

export type MuokattuJonosijaMachineInput = {
  valintatapajonoOid: string;
  jonosija: LaskennanJonosijaTulos;
};

export type MuokattuJonosijaEvents =
  | MuokattuJonosijaChangeEvent
  | MuokattuJonosijaSaveEvent
  | MuokattuJonosijaDeleteEvent;
