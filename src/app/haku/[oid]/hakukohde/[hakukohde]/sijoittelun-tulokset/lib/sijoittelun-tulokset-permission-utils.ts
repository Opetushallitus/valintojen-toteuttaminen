import { isToinenAsteKohdejoukko } from '@/app/lib/kouta';
import { UserPermissions } from '@/app/lib/permissions';
import { Haku } from '@/app/lib/types/kouta-types';

export const isKirjeidenMuodostaminenAllowed = (
  haku: Haku,
  permissions: UserPermissions,
  kaikkiJonotHyvaksytty: boolean,
) => {
  return (
    !isToinenAsteKohdejoukko(haku) ||
    permissions.hasOphCRUD ||
    kaikkiJonotHyvaksytty
  );
};

export const isSendVastaanottoPostiVisible = (
  haku: Haku,
  permissions: UserPermissions,
) => {
  return !isToinenAsteKohdejoukko(haku) || permissions.hasOphCRUD;
};
