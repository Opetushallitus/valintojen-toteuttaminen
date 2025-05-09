import { Language, TranslatedName } from '../localization/localization-types';
import { HakijaInfo } from '../ataru/ataru-types';
import { HakutoiveValintakoeOsallistumiset } from '../valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-types';
import { Valintakoe } from '../valintaperusteet/valintaperusteet-types';
import { KoutaOidParams } from '../kouta/kouta-types';

export type Ryhmittely = 'kokeittain' | 'hakijoittain';

export type ValintakoeOsallistuminen =
  | 'OSALLISTUU'
  | 'EI_OSALLISTU'
  | 'EI_VAADITA'
  | 'VIRHE';

export type GetValintakoekutsutParams = KoutaOidParams & {
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

export type ValintakoekutsutDownloadProps = KoutaOidParams & {
  valintakoeTunniste: Array<string>;
  selection?: Set<string>;
};
