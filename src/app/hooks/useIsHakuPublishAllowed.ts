import { canHakuBePublished } from '../lib/sijoittelun-tulokset-utils';
import { Haku } from '../lib/kouta/kouta-types';
import { useHaunAsetukset } from './useHaunAsetukset';
import { useUserPermissions } from './useUserPermissions';

export const useIsHakuPublishAllowed = ({ haku }: { haku: Haku }) => {
  const { data: permissions } = useUserPermissions();
  const { data: haunAsetukset } = useHaunAsetukset({ hakuOid: haku.oid });

  return permissions.admin || canHakuBePublished(haku, haunAsetukset);
};
