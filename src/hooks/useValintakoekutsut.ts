'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { tryGetValintakoekutsutData } from '../lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import {
  selectValintakoekutsutHakijoittain,
  selectValintakoekutsutKokeittain,
  ValintakoekutsutHakijoittain,
  ValintakoekutsutKokeittain,
} from '../lib/select-valintakoekutsut';
import {
  GetValintakoekutsutParams,
  ValintakoekutsutData,
} from '../lib/types/valintakoekutsut-types';

const useValintakoekutsutData = <T>({
  hakuOid,
  hakukohdeOid,
  select,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  select: (data: ValintakoekutsutData) => T;
}) => {
  const { data: valintakoekutsutData } = useSuspenseQuery({
    queryKey: ['getValintakoekutsutData', hakukohdeOid],
    queryFn: () => tryGetValintakoekutsutData({ hakuOid, hakukohdeOid }),
    select,
  });
  return valintakoekutsutData;
};

export const useValintakoekutsutHakijoittain = ({
  hakuOid,
  hakukohdeOid,
  vainKutsuttavat,
}: Omit<GetValintakoekutsutParams, 'ryhmittely'>) => {
  return useValintakoekutsutData<ValintakoekutsutHakijoittain>({
    hakuOid,
    hakukohdeOid,
    select: (data) =>
      selectValintakoekutsutHakijoittain(
        { hakukohdeOid, vainKutsuttavat },
        data,
      ),
  });
};

export const useValintakoekutsutKokeittain = ({
  hakuOid,
  hakukohdeOid,
  vainKutsuttavat,
}: Omit<GetValintakoekutsutParams, 'ryhmittely'>) => {
  return useValintakoekutsutData<ValintakoekutsutKokeittain>({
    hakuOid,
    hakukohdeOid,
    select: (data) =>
      selectValintakoekutsutKokeittain({ hakukohdeOid, vainKutsuttavat }, data),
  });
};
