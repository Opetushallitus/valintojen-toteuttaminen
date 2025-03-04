import {
  LaskennanValintatapajonoTulosWithHakijaInfo,
  LaskennanValinnanvaiheInfo,
} from '@/app/hooks/useEditableValintalaskennanTulokset';
import { Haku } from '@/app/lib/kouta/kouta-types';

export type ValintatapajonoContentProps = {
  haku: Haku;
  hakukohdeOid: string;
  valinnanVaihe: LaskennanValinnanvaiheInfo;
  jono: LaskennanValintatapajonoTulosWithHakijaInfo;
};
