import { Language, TranslatedName } from '../localization/localization-types';
import { HakijaInfo } from './ataru-types';
import { HakutoiveValintakoeOsallistumiset } from './valintalaskentakoostepalvelu-types';
import { Valintakoe } from './valintaperusteet-types';

export type Ryhmittely = 'kokeittain' | 'hakijoittain';

export type ValintakoeOsallistuminen =
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
  osallistuminen: `osallistuminen.${ValintakoeOsallistuminen}`;
  lisatietoja: TranslatedName;
  laskettuPvm: string;
};

export type ValintakoekutsutData = {
  valintakokeet: Array<Valintakoe>;
  hakemuksetByOid: Record<
    string,
    Pick<
      HakijaInfo,
      'hakijanNimi' | 'hakemusOid' | 'hakijaOid' | 'asiointikieliKoodi'
    >
  >;
  valintakoeOsallistumiset: Array<HakutoiveValintakoeOsallistumiset>;
};

export type ValintakoekutsutDownloadProps = {
  hakuOid: string;
  hakukohdeOid: string;
  valintakoeTunniste: Array<string>;
  selection?: Set<string>;
};
