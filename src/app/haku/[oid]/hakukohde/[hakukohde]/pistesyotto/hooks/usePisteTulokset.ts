import { getPisteetForHakukohde } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

type UsePisteTuloksetProps = {
  hakuOid: string;
  hakukohdeOid: string;
};

export const pisteTuloksetOptions = ({
  hakuOid,
  hakukohdeOid,
}: UsePisteTuloksetProps) =>
  queryOptions({
    queryKey: ['getPisteetForHakukohde', hakuOid, hakukohdeOid],
    queryFn: () => getPisteetForHakukohde(hakuOid, hakukohdeOid),
  });

export const usePisteTulokset = ({
  hakuOid,
  hakukohdeOid,
}: UsePisteTuloksetProps) =>
  useSuspenseQuery(pisteTuloksetOptions({ hakuOid, hakukohdeOid }));
