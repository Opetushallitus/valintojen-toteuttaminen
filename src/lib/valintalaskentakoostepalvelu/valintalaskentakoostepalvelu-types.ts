import { Language } from '../localization/localization-types';
import { ValintakoeOsallistuminen } from '../types/valintakoekutsut-types';
import {
  IlmoittautumisTila,
  ValinnanTila,
  VastaanottoTila,
} from '../types/sijoittelu-types';

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
  'hyvaksymiskirjeet' | 'sijoitteluntulokset' | 'osoitetarrat';

export type LetterCounts = {
  templateName: string;
  lang: Language;
  letterBatchId: number | null;
  letterTotalCount: number;
  letterReadyCount: number;
  letterErrorCount: number;
  letterPublishedCount: number;
  readyForPublish: boolean;
  readyForEPosti: boolean;
  groupEmailId: number | null;
};

export type HakukohteenSuodatustiedot = {
  hasValintakoe: boolean;
  varasijatayttoPaattyy?: Date;
  laskettu: boolean;
  sijoittelematta: boolean;
  julkaisematta: boolean;
};

export type HakukohteidenSuodatustiedot = Record<
  string,
  HakukohteenSuodatustiedot
>;

// valinta-tulos-servicen valintatila. Sisältää ValinnanTila-arvojen lisäksi tilan KESKEN,
// jota VTS käyttää, kun hakutoiveella ei ole vielä (julkaistua) tulosta.
export type Valintatila = ValinnanTila | 'KESKEN';

type TilanKuvaukset = {
  FI?: string;
  SV?: string;
  EN?: string;
};

export type JonokohtainenTulostieto = {
  oid: string;
  nimi: string;
  pisteet?: number;
  alinHyvaksyttyPistemaara?: number;
  valintatila: Valintatila;
  julkaistavissa: boolean;
  valintatapajonoPrioriteetti: number;
  tilanKuvaukset: TilanKuvaukset;
  ehdollisestiHyvaksyttavissa: boolean;
  ehdollisenHyvaksymisenEhto?: TilanKuvaukset;
  eiVarasijatayttoa: boolean;
  varasijasaannotKaytossa: boolean;
};

export type HakutoiveenVastaanottoTila = {
  hakukohdeOid: string;
  hakukohdeNimi: string;
  tarjoajaOid: string;
  tarjoajaNimi: string;
  valintatapajonoOid: string;
  valintatila: Valintatila;
  vastaanottotila: VastaanottoTila;
  ilmoittautumistila: {
    ilmoittautumisaika: {
      alku?: string;
      loppu?: string;
    };
    ilmoittautumistila: IlmoittautumisTila;
    ilmoittauduttavissa: boolean;
  };
  vastaanotettavuustila: string;
  vastaanottoDeadline?: string;
  viimeisinHakemuksenTilanMuutos?: string;
  viimeisinValintatuloksenMuutos?: string;
  hyvaksyttyJaJulkaistuDate?: string;
  jonosija?: number;
  varasijanumero?: number;
  varasijojaTaytetaanAsti?: string;
  julkaistavissa: boolean;
  ehdollisestiHyvaksyttavissa: boolean;
  ehdollisenHyvaksymisenEhtoKoodi?: string;
  ehdollisenHyvaksymisenEhtoFI?: string;
  ehdollisenHyvaksymisenEhtoSV?: string;
  ehdollisenHyvaksymisenEhtoEN?: string;
  tilanKuvaukset: TilanKuvaukset;
  showMigriURL?: boolean;
  pisteet?: number;
  jonokohtaisetTulostiedot: Array<JonokohtainenTulostieto>;
  naytetytPaatettavatOpiskeluoikeudet: Array<unknown>;
};

export type HakemuksenVastaanottoTilat = {
  hakuOid: string;
  hakemusOid: string;
  hakijaOid: string;
  aikataulu?: {
    vastaanottoEnd?: string;
    vastaanottoBufferDays?: number;
  };
  hakutoiveet: Array<HakutoiveenVastaanottoTila>;
};
