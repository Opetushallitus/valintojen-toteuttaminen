import { UserPermissions } from '@/lib/permissions';
import { Haku } from '@/lib/kouta/kouta-types';
import { isToinenAsteKohdejoukko } from '@/lib/kouta/kouta-service';

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
