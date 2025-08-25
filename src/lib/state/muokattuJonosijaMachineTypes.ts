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
  jonosija: LaskennanJonosijaTulos;
  changedKriteerit: Array<JarjestyskriteeriParams>;
  onSuccess: () => void;
};

export type MuokattuJonosijaEvents =
  | MuokattuJonosijaChangeEvent
  | MuokattuJonosijaSaveEvent
  | MuokattuJonosijaDeleteEvent;
