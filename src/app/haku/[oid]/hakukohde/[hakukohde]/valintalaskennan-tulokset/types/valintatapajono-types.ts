import {
  LaskennanValintatapajonoTulosWithHakijaInfo,
  LaskennanValinnanvaiheInfo,
} from '@/app/hooks/useEditableValintalaskennanTulokset';
import { Haku } from '@/app/lib/types/kouta-types';

export type ValintatapajonoContentProps = {
  haku: Haku;
  hakukohdeOid: string;
  valinnanVaihe: LaskennanValinnanvaiheInfo;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
};
