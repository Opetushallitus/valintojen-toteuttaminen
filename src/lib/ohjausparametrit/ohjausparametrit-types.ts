export type HaunAsetukset = {
  sijoittelu: boolean;
  valintaEsityksenHyvaksyminen?: Date;
  varasijatayttoPaattyy?: Date;
  valinnatEstettyOppilaitosvirkailijoilta?: {
    dateStart: number | null;
    dateEnd: number | null;
  };
  harkinnanvarainenTallennusPaattyy?: Date;
};
