import { queryOptions } from '@tanstack/react-query';
import { UserPermissions } from '../permissions';
import { getHaku, getHakukohde, getHakukohteet } from './kouta-service';

export const queryOptionsGetHakukohteet = (
  hakuOid: string,
  userPermissions: UserPermissions,
) =>
  queryOptions({
    queryKey: ['getHakukohteet', hakuOid, userPermissions],
    queryFn: () => getHakukohteet(hakuOid, userPermissions),
  });

export const queryOptionsGetHaku = ({ hakuOid }: { hakuOid: string }) =>
  queryOptions({
    queryKey: ['getHaku', hakuOid],
    queryFn: () => getHaku(hakuOid),
  });

export const queryOptionsGetHakukohde = ({
  hakukohdeOid,
}: {
  hakukohdeOid: string;
}) =>
  queryOptions({
    queryKey: ['getHakukohde', hakukohdeOid],
    queryFn: () => getHakukohde(hakukohdeOid),
  });
