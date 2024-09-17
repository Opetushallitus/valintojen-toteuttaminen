import { Language, TranslatedName } from '../localization/localization-types';

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
  henkiloOid: string;
  hakijanNimi: string;
  asiointiKieli: Language;
  osallistuminen: Osallistuminen;
  lisatietoja: TranslatedName;
  laskettuPvm: string;
};
