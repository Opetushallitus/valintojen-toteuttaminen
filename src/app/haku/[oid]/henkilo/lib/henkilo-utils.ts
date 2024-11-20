export const getHenkiloTitle = (henkilo: {
  henkilotunnus: string;
  hakijanNimi: string;
}) =>
  `${henkilo.hakijanNimi} ${henkilo.henkilotunnus ? `(${henkilo.henkilotunnus})` : ''}`;
