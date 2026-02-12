import { client } from '../http-client';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { HarkinnanvaraisuudenSyy } from '@/lib/types/harkinnanvaraiset-types';

type HakemuksenHarkinnanvaraisuustiedot = {
  hakemusOid: string;
  hakutoiveet: Array<{
    hakukohdeOid: string;
    harkinnanvaraisuudenSyy: HarkinnanvaraisuudenSyy;
  }>;
};

export const getHarkinnanvaraisuudetHakemuksille = async ({
  hakemusOids,
}: {
  hakemusOids: Array<string>;
}) => {
  const configuration = getConfiguration();
  const res = await client.post<Array<HakemuksenHarkinnanvaraisuustiedot>>(
    configuration.routes.suorituspalvelu.harkinnanvaraisuudetHakemuksilleUrl,
    { hakemusOids: hakemusOids },
  );
  return res.data;
};
