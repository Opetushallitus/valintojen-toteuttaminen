import { isEmptyish } from 'remeda';
import { PersonDetails } from './oppijanumerorekisteri/onr-types';

export const getHenkiloTitle = (henkilo: {
  henkilotunnus: string;
  hakijanNimi: string;
}) =>
  `${henkilo.hakijanNimi} ${henkilo.henkilotunnus ? `(${henkilo.henkilotunnus})` : ''}`;

export const getHenkiloInitials = (henkilo: PersonDetails) => {
  if (
    !henkilo ||
    isEmptyish(henkilo.etunimet) ||
    isEmptyish(henkilo.sukunimi)
  ) {
    return '';
  }
  return `${henkilo.etunimet.charAt(0)}${henkilo.sukunimi.charAt(0)}`;
};
