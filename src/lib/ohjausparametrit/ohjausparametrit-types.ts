export type HaunAsetukset = {
  sijoittelu: boolean;
  valintaEsityksenHyvaksyminen?: Date;
  // PH_OLVVPKE: "Oppilaitosten virkailijoiden valintapalvelun käyttö estetty"
  PH_OLVVPKE?: {
    dateStart: number;
    dateEnd: number;
  };
};
