import { LasketutValinnanvaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { ValintakokeenPisteet } from '@/app/lib/types/laskenta-types';
import { ValinnanTulosModel } from '@/app/lib/types/valinta-tulos-types';
import { ValintakoeAvaimet } from '@/app/lib/types/valintaperusteet-types';

export type ValinnanTulosLisatiedoilla = ValinnanTulosModel & {
  lastModified: string | null;
  varasijanNumero?: number;
  hyvaksyttyHarkinnanvaraisesti: boolean;
};

export type HenkilonHakukohdeTuloksilla = Hakukohde & {
  hakutoiveNumero: number;
  valinnanvaiheet?: LasketutValinnanvaiheet;
  valinnanTulos?: ValinnanTulosLisatiedoilla;
  kokeet?: Array<ValintakoeAvaimet>;
  pisteet?: Array<ValintakokeenPisteet>;
};
