import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { getPisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

export const pisteTuloksetOptions = ({
  hakuOid,
  hakukohdeOid,
}: KoutaOidParams) =>
  queryOptions({
    queryKey: ['getPisteetForHakukohde', hakuOid, hakukohdeOid],
    queryFn: () => getPisteetForHakukohde(hakuOid, hakukohdeOid),
  });

export const usePisteTulokset = ({ hakuOid, hakukohdeOid }: KoutaOidParams) =>
  useSuspenseQuery(pisteTuloksetOptions({ hakuOid, hakukohdeOid }));
