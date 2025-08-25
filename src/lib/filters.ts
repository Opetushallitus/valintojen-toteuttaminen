export const hakemusFilter = (
  hakemus: {
    hakemusOid: string;
    hakijanNimi: string;
    hakijaOid: string;
    henkilotunnus?: string | null;
  },
  searchPhrase: string,
) =>
  Boolean(
    hakemus.hakijanNimi
      .toLowerCase()
      .includes(searchPhrase?.toLowerCase() ?? '') ||
      hakemus.hakemusOid
        .toLowerCase()
        .includes(searchPhrase?.toLowerCase() ?? '') ||
      hakemus.hakijaOid
        .toLowerCase()
        .includes(searchPhrase?.toLowerCase() ?? '') ||
      hakemus.henkilotunnus
        ?.toLowerCase()
        .includes(searchPhrase?.toLowerCase() ?? ''),
  );
