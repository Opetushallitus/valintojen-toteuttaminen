export type HaunAsetukset = {
  sijoittelu: boolean;
  valintaEsityksenHyvaksyminen?: Date;
  varasijatayttoPaattyy?: Date;
  synteettisetHakemukset?: boolean;
  valinnatEstettyOppilaitosvirkailijoilta?: {
    dateStart: number | null;
    dateEnd: number | null;
  };
  harkinnanvarainenTallennusPaattyy?: Date;
};
