export const hakemusFilter = (
  hakemus: { hakemusOid: string; hakijanNimi: string; hakijaOid: string },
  searchPhrase: string,
) =>
  hakemus.hakijanNimi
    .toLowerCase()
    .includes(searchPhrase?.toLowerCase() ?? '') ||
  hakemus.hakemusOid
    .toLowerCase()
    .includes(searchPhrase?.toLowerCase() ?? '') ||
  hakemus.hakijaOid.toLowerCase().includes(searchPhrase?.toLowerCase() ?? '');
