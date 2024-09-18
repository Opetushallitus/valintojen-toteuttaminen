'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getValintakoekutsutData } from '../lib/valintalaskentakoostepalvelu';
import { useMemo } from 'react';
import { createValintakoekutsutKokeittain } from '../lib/createValintakoekutsut';
import { GetValintakoekutsutParams } from '../lib/types/valintakoekutsut-types';

export const useValintakoekutsut = ({
  hakuOid,
  hakukohdeOid,
  ryhmittely,
  vainKutsuttavat,
}: GetValintakoekutsutParams) => {
  const { data: valintakoekutsutData } = useSuspenseQuery({
    queryKey: ['getValintakoekutsutData', hakukohdeOid],
    queryFn: () => getValintakoekutsutData({ hakuOid, hakukohdeOid }),
  });

  return useMemo(() => {
    if (ryhmittely === 'kokeittain') {
      return createValintakoekutsutKokeittain(
        { hakukohdeOid, vainKutsuttavat },
        valintakoekutsutData,
      );
    } else {
      // TODO: Toteuta ryhmittely hakijoittain
      return {};
    }
  }, [hakukohdeOid, vainKutsuttavat, ryhmittely, valintakoekutsutData]);
};
