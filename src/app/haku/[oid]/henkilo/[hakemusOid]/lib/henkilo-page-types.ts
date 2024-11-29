import { LasketutValinnanvaiheet } from '@/app/hooks/useLasketutValinnanVaiheet';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { ValinnanTulosModel } from '@/app/lib/types/valinta-tulos-types';

export type ValinnanTulosLisatiedoilla = ValinnanTulosModel & {
  lastModified: string | null;
  varasijanNumero?: number;
  hyvaksyttyHarkinnanvaraisesti: boolean;
};

export type HenkilonHakukohdeTuloksilla = Hakukohde & {
  valinnanvaiheet?: LasketutValinnanvaiheet;
  valinnanTulos?: ValinnanTulosLisatiedoilla;
};
