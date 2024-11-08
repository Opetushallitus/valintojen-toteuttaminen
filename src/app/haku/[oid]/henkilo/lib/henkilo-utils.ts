import { Hakemus } from '@/app/lib/types/ataru-types';

export const getHenkiloTitle = (henkilo: Hakemus) =>
  `${henkilo.hakijanNimi} ${henkilo.henkilotunnus ? `(${henkilo.henkilotunnus})` : ''}`;
