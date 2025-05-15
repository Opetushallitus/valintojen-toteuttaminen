'use client';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';
import { hakijoidenVastaanottotilatValintatapajonolle } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { useSuspenseQuery } from '@tanstack/react-query';

export const useHakijanVastaanottotila = ({
  hakuOid,
  hakukohdeOid,
  valintatapajonoOid,
  hakemusOids,
}: KoutaOidParams & {
  valintatapajonoOid: string;
  hakemusOids: Array<string>;
}) =>
  useSuspenseQuery({
    queryKey: [
      'getHakijoidenVastaanottotilatValintatapajonolle',
      hakuOid,
      hakukohdeOid,
      valintatapajonoOid,
      hakemusOids,
    ],
    queryFn: () =>
      hakijoidenVastaanottotilatValintatapajonolle(
        hakuOid,
        hakukohdeOid,
        valintatapajonoOid,
        hakemusOids,
      ),
    staleTime: Infinity,
  });
