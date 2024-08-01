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
};

export type Valinnanvaihe = {
  nimi: string;
  aktiivinen: boolean;
  valisijoittelu: boolean;
  tyyppi: ValinnanvaiheTyyppi;
  oid: string;
  jonot: Valintatapajono[];
};
