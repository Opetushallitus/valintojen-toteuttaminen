import { Language } from '../localization/localization-types';
import { ValintakoeOsallistuminen } from '../types/valintakoekutsut-types';

export type HakutoiveValintakoe = {
  valintakoeOid: string;
  valintakoeTunniste: string;
  nimi: string;
  aktiivinen: boolean;
  lahetetaankoKoekutsut: boolean;
  kutsutaankoKaikki: boolean | null;
  osallistuminenTulos: {
    osallistuminen: ValintakoeOsallistuminen;
    kuvaus: {
      FI?: string;
      SV?: string;
      EN?: string;
    };
  };
};

export type HakutoiveValintakoeOsallistumiset = {
  hakuOid: string;
  hakemusOid: string;
  hakijaOid: string;
  createdAt: string;
  hakutoiveet: Array<{
    hakukohdeOid: string;
    valinnanVaiheet: Array<{
      valinnanVaiheOid: string;
      valinnanVaiheJarjestysluku: number;
      valintakokeet: Array<HakutoiveValintakoe>;
    }>;
  }>;
};

export type KirjepohjaNimi =
  | 'hyvaksymiskirje'
  | 'jalkiohjauskirje'
  | 'jalkiohjauskirje_huoltajille'
  | 'hyvaksymiskirje_huoltajille';

export type Kirjepohja = {
  nimi: string;
  sisalto: string;
};

export type DokumenttiTyyppi =
  | 'hyvaksymiskirjeet'
  | 'sijoitteluntulokset'
  | 'osoitetarrat';

export type LetterCounts = {
  templateName: string,
  lang: Language,
  letterBatchId: number | null,
  letterTotalCount: number,
  letterReadyCount: number,
  letterErrorCount: number,
  letterPublishedCount: number,
};
