import { Toast } from '@/hooks/useToaster';
import { HakemuksenValinnanTulos } from '../valinta-tulos-service/valinta-tulos-types';

export type ValinnanTulosEditableFieldNames =
  | 'julkaistavissa'
  | 'valinnanTila'
  | 'valinnanTilanKuvausFI'
  | 'valinnanTilanKuvausSV'
  | 'valinnanTilanKuvausEN'
  | 'vastaanottoTila'
  | 'ilmoittautumisTila'
  | 'ehdollisestiHyvaksyttavissa'
  | 'ehdollisenHyvaksymisenEhtoKoodi'
  | 'ehdollisenHyvaksymisenEhtoFI'
  | 'ehdollisenHyvaksymisenEhtoSV'
  | 'ehdollisenHyvaksymisenEhtoEN'
  | 'hyvaksyttyVarasijalta'
  | 'maksunTila';

export type ValinnanTulosEditableFields = Partial<
  Pick<HakemuksenValinnanTulos, ValinnanTulosEditableFieldNames>
>;

export type ValinnanTulosContext<T extends HakemuksenValinnanTulos> = {
  addToast?: (toast: Toast) => void;
  onUpdated?: () => void;
  hakukohdeOid?: string;
  valintatapajonoOid?: string;
  lastModified?: string;
  hakemukset: Array<T>;
  changedHakemukset: Array<T>;
  hakemuksetForMassUpdate?: Array<T>;
  massChangeAmount?: number;
  publishAfterUpdate?: boolean;
  hakemusOidForRemoval?: string;
  mode: 'sijoittelu' | 'valinta';
};

export enum ValinnanTulosState {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  PUBLISHING = 'PUBLISHING',
  REMOVING = 'REMOVING',
}

export enum ValinnanTulosEventType {
  UPDATE = 'UPDATE',
  MASS_UPDATE = 'MASS_UPDATE',
  MASS_CHANGE = 'MASS_CHANGE',
  CHANGE = 'CHANGE',
  PUBLISH = 'PUBLISH',
  RESET = 'RESET',
  REMOVE = 'REMOVE',
}

export type ValinnanTulosUpdateEvent = {
  type: ValinnanTulosEventType.UPDATE;
};

export type ValinnanTulosMachineParams<T extends HakemuksenValinnanTulos> = {
  hakukohdeOid: string;
  valintatapajonoOid?: string;
  hakemukset: Array<T>;
  lastModified?: string;
  addToast: (toast: Toast) => void;
  /**
   * Kutsutaan, jos ainakin osa hakemuksista saatiin päivitettyä onnistuneesti.
   */
  onUpdated?: () => void;
};

export type ValinnanTulosResetEvent<T extends HakemuksenValinnanTulos> = {
  type: ValinnanTulosEventType.RESET;
  params: ValinnanTulosMachineParams<T>;
};

/**
 * Massatallennus parametrina annetuilla tiedoilla. Ei käytetä tallennuksessa changedHakemukset-arvoja.
 * */
export type ValinnanTulosMassUpdateEvent = {
  type: ValinnanTulosEventType.MASS_UPDATE;
} & ValinnanTulosMassChangeParams;

/**
 * Massamuutos parametrina annetuilla tiedoilla. Ei tallenna tietoja, vaan muuttaa context.changedHakemukset-arvoja.
 */
export type ValinnanTulosMassChangeEvent = {
  type: ValinnanTulosEventType.MASS_CHANGE;
} & ValinnanTulosMassChangeParams;

export type ValinnanTulosMassChangeParams = Pick<
  ValinnanTulosEditableFields,
  'valinnanTila' | 'vastaanottoTila' | 'ilmoittautumisTila'
> & {
  hakemusOids: Set<string>;
};

export type ValinnanTulosChangeParams = ValinnanTulosEditableFields & {
  hakemusOid: string;
};

export type ValinnanTulosChangeEvent = {
  type: ValinnanTulosEventType.CHANGE;
} & ValinnanTulosChangeParams;

export type ValinnanTulosPublishEvent = {
  type: ValinnanTulosEventType.PUBLISH;
};

export type ValinnanTulosRemoveEvent = {
  type: ValinnanTulosEventType.REMOVE;
  hakemusOid: string;
};

export type ValinnanTuloksetEvents<T extends HakemuksenValinnanTulos> =
  | ValinnanTulosUpdateEvent
  | ValinnanTulosChangeEvent
  | ValinnanTulosMassChangeEvent
  | ValinnanTulosPublishEvent
  | ValinnanTulosMassUpdateEvent
  | ValinnanTulosResetEvent<T>
  | ValinnanTulosRemoveEvent;
