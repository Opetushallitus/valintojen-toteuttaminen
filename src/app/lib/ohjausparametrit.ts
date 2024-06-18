'use client';

import { configuration } from './configuration';
import { client } from './http-client';

export type HaunAsetukset = {
  sijoittelu: boolean;
};

export const getHaunAsetukset = async (
  hakuOid: string,
): Promise<HaunAsetukset> => {
  const response = await client.get(
    `${configuration.ohjausparametritUrl}/${hakuOid}`,
  );
  return { sijoittelu: response.data.sijoittelu };
};
