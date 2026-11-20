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
) =>
  queryOptions({
    queryKey: ['getValintaryhmat', hakuOid, userPermissions],
    queryFn: () => getValintaryhmat(hakuOid, userPermissions),
  });
