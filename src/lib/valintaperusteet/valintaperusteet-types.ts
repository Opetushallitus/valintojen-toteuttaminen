export type Valintaryhma = {
  nimi: string;
  oid: string;
};

export enum ValinnanvaiheTyyppi {
  VALINTAKOE = 'valinnanvaihe.tyyppi.valintakoe',
  TAVALLINEN = 'valinnanvaihe.tyyppi.tavallinen',
}

export type Valintatapajono = {
  nimi: string;
  oid: string;
  eiLasketaPaivamaaranJalkeen?: Date;
  prioriteetti: number;
  kaytetaanValintalaskentaa: boolean;
  automaattinenSijoitteluunSiirto?: boolean;
};

export type Valinnanvaihe = {
  nimi: string;
  aktiivinen: boolean;
  valisijoittelu: boolean;
  tyyppi: ValinnanvaiheTyyppi;
  oid: string;
  jonot: Array<Valintatapajono>;
};

export enum ValintakoeInputTyyppi {
  BOOLEAN,
  BOOLEAN_ACCEPTED,
  SELECT,
  INPUT,
}

export type ValintakoeAvaimet = {
  tunniste: string;
  osallistuminenTunniste: string;
  kuvaus: string;
  arvot?: Array<string>;
  max?: string;
  min?: string;
  vaatiiOsallistumisen: boolean;
  inputTyyppi: ValintakoeInputTyyppi;
};

export type Valintakoe = {
  nimi: string;
  aktiivinen: boolean;
  lahetetaankoKoekutsut: boolean;
  kutsutaankoKaikki: boolean;
  selvitettyTunniste: string;
};

export type ValintaryhmaHakukohteilla = {
  nimi: string;
  oid: string;
  hakukohteet: Array<string>;
  alaValintaryhmat: Array<ValintaryhmaHakukohteilla>;
  parentOid: string | null;
};
