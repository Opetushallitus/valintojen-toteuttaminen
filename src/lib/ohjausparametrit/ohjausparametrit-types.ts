export type HaunAsetukset = {
  sijoittelu: boolean;
  valintaEsityksenHyvaksyminen?: Date;
  varasijatayttoPaattyy?: Date;
  valinnatEstettyOppilaitosvirkailijoilta?: {
    dateStart: number;
    dateEnd: number;
  };
};
