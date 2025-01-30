import {
  LaskettuJonoWithHakijaInfo,
  LaskettuValinnanvaiheInfo,
} from '@/app/hooks/useLasketutValinnanVaiheet';
import { Haku } from '@/app/lib/types/kouta-types';

export type ValintatapajonoContentProps = {
  haku: Haku;
  hakukohdeOid: string;
  valinnanVaihe: LaskettuValinnanvaiheInfo;
  jono: LaskettuJonoWithHakijaInfo;
};
