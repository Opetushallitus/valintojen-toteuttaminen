import { LaskennanValinnanvaiheet } from '@/app/hooks/useEditableValintalaskennanTulokset';
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
  valinnanvaiheet?: LaskennanValinnanvaiheet;
  valinnanTulos?: ValinnanTulosLisatiedoilla;
  kokeet?: Array<ValintakoeAvaimet>;
  pisteet?: Array<ValintakokeenPisteet>;
};
