import { HierarchyUserPermissions } from '../permissions';
import { queryOptions } from '@tanstack/react-query';
import {
  getHakukohteenValinnanvaiheet,
  getValintaryhmat,
} from './valintaperusteet-service';

export const queryOptionsGetHakukohteenValinnanvaiheet = (
  hakukohdeOid: string,
) => {
  return queryOptions({
    queryKey: ['getHakukohteenValinnanvaiheet', hakukohdeOid],
    queryFn: () => getHakukohteenValinnanvaiheet(hakukohdeOid),
  });
};

export const queryOptionsGetValintaryhmat = (
  hakuOid: string,
  userPermissions: HierarchyUserPermissions,
  hakukohdeOids: Array<string>,
) =>
  queryOptions({
    queryKey: ['getValintaryhmat', hakuOid, userPermissions, hakukohdeOids],
    queryFn: () => getValintaryhmat(hakuOid, userPermissions, hakukohdeOids),
  });
