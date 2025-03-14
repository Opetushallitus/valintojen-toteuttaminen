'use client';
import { hakijoidenVastaanottotilatValintatapajonolle } from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { useSuspenseQuery } from '@tanstack/react-query';

export const useHakijanVastaanottotila = (
  hakuOid: string,
  hakukohdeOid: string,
  valintatapajonoOid: string,
  hakemusOids: Array<string>,
) =>
  useSuspenseQuery({
    queryKey: [
      'getHyvaksynnanEhdot',
      hakuOid,
      hakukohdeOid,
      valintatapajonoOid,
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
