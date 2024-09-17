import { Language, TranslatedName } from '../localization/localization-types';
import { ValintakoeData } from '../valintaperusteet';
import { HakijaInfo } from './ataru-types';
import { ValintakoeOsallistumistulos } from './valintalaskentakoostepalvelu-types';

export type Ryhmittely = 'kokeittain' | 'hakijoittain';

export type Osallistuminen =
  | 'OSALLISTUU'
  | 'EI_OSALLISTU'
  | 'EI_VAADITA'
  | 'VIRHE';

export type GetValintakoekutsutParams = {
  hakuOid: string;
  hakukohdeOid: string;
  ryhmittely: Ryhmittely;
  vainKutsuttavat: boolean;
};

export type ValintakoeKutsuItem = {
  hakemusOid: string;
  hakijaOid: string;
  hakijanNimi: string;
  asiointiKieli: Language;
  osallistuminen: Osallistuminen;
  lisatietoja: TranslatedName;
  laskettuPvm: string;
};

export type ValintakoekutsutData = {
  valintakokeetByTunniste: Record<string, ValintakoeData>;
  hakemuksetByOid: Record<string, HakijaInfo>;
  valintakoeOsallistumiset: Array<ValintakoeOsallistumistulos>;
};
