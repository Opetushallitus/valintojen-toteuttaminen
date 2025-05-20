import { LaskennanValinnanvaiheet } from '@/hooks/useEditableValintalaskennanTulokset';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { ValintakokeenPisteet } from '@/lib/types/laskenta-types';
import { ValinnanTulosModel } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { ValintakoeAvaimet } from '@/lib/valintaperusteet/valintaperusteet-types';

export type ValinnanTulosLisatiedoilla = ValinnanTulosModel & {
  lastModified: string | null;
  varasijanNumero?: number;
  hyvaksyttyHarkinnanvaraisesti: boolean;
};

export type HenkilonHakukohdeTuloksilla = Hakukohde & {
  hakutoiveNumero: number;
  readOnly: boolean;
  valinnanvaiheet?: LaskennanValinnanvaiheet;
  valinnanTulos?: ValinnanTulosLisatiedoilla;
  kokeet?: Array<ValintakoeAvaimet>;
  pisteet?: Array<ValintakokeenPisteet>;
};
