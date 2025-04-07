import { Hakemus } from '@/lib/ataru/ataru-types';
import { ValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';

export type HakemusValinnanTuloksilla = Hakemus & {
  valinnanTulos?: ValinnanTulos;
};
