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
  /**
   * Alkuperäiset hakemusten tulokset, jotka on ladattu palvelimelta.
   */
  hakemukset: Array<T>;
  /**
   * Hakemukset, joiden tuloksia käyttäjä on muokannut ja joita ei ole tallennettu
   */
  changedHakemukset: Array<T>;
  /**
   * Hakemukset massapäivitystä (myöhästyneeksi merkintä) varten. Erillään muokatuista hakemuksista, koska
   * massapäivityksessä halutaan suoraan päivittää tietyt hakemukset, eikä käyttäjän muokkaamia.
   * Täytyy tallentaa kontekstiin, jotta voidaan lukea eri tilassa kuin asetetaan.
   */
  hakemuksetForMassUpdate?: Array<T>;
  /**
   * Massapäivityksessä muuttuneiden hakemusten määrä. Asetetaan onnistuneen massapäivityksen jälkeen.
   */
  massChangeAmount?: number;
  /**
   * Hyväksytäänkö valintaesitys myös tallennuksen lisäksi? Asetetaan PUBLISH-eventin seurauksena.
   */
  publishAfterUpdate?: boolean;
  /**
   * Hakemuksen oid, joka poistetaan. Asetetaan REMOVE-eventin seurauksena.
   */
  hakemusOidForRemoval?: string;
  /**
   *
   */
  mode: 'sijoittelu' | 'valinta';
};

export enum ValinnanTulosState {
  IDLE = 'IDLE',
  UPDATING = 'UPDATING',
  PUBLISHING = 'PUBLISHING',
  REMOVING = 'REMOVING',
}

export enum ValinnanTulosEventType {
  /**
   * Tallenna tulokset palvelimelle.
   */
  UPDATE = 'UPDATE',
  /**
   * Massapäivitys (myöhästyneeksi merkintä) tuloksille.
   */
  MASS_UPDATE = 'MASS_UPDATE',
  /**
   * Massamuutos (esim. vastaanottotilan muuttaminen) tuloksille. Muuttaa kontekstia, mutta ei tallenna.
   */
  MASS_CHANGE = 'MASS_CHANGE',
  /**
   * Muuta yhden hakemuksen tulosta.
   */
  CHANGE = 'CHANGE',
  /**
   * Tallenna tulokset ja hyväksy valintaesitys.
   */
  PUBLISH = 'PUBLISH',
  /**
   * Nollaa tilakoneen tila. Kutsutaan kun ladataan hakemukset uudelleen palvelimelta.
   */
  RESET = 'RESET',
  /**
   * Poista tallennettu tulos hakemukselta.
   */
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
