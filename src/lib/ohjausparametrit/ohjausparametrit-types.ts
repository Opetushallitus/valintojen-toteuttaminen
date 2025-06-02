export type HaunAsetukset = {
  sijoittelu: boolean;
  valintaEsityksenHyvaksyminen?: Date;
  // PH_OLVVPKE: "Oppilaitosten virkailijoiden valintapalvelun käyttö estetty"
  valinnatEstettyOppilaitosvirkailijoilta?: {
    dateStart: number;
    dateEnd: number;
  };
};
