import { Haku } from '@/lib/kouta/kouta-types';
import { useHaunAsetukset } from '../lib/ohjausparametrit/useHaunAsetukset';
import { isValintaesitysJulkaistavissa } from '../lib/sijoittelun-tulokset-utils';
import { useUserPermissions } from './useUserPermissions';

export const useIsValintaesitysJulkaistavissa = ({ haku }: { haku: Haku }) => {
  const permissions = useUserPermissions();
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid: haku.oid });

  return isValintaesitysJulkaistavissa(haku, permissions, haunAsetukset);
};
