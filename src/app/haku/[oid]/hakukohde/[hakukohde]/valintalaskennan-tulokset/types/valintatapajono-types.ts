import {
  LaskennanValintatapajonoTulosWithHakijaInfo,
  LaskennanValinnanvaiheInfo,
} from '@/hooks/useEditableValintalaskennanTulokset';
import { Haku } from '@/lib/kouta/kouta-types';

export type ValintatapajonoContentProps = {
  haku: Haku;
  hakukohdeOid: string;
  valinnanVaihe: LaskennanValinnanvaiheInfo;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
};
