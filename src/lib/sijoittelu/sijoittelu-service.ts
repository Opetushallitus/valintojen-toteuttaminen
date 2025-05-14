import { isNullish } from 'remeda';
import { client } from '../http-client';
import { AjastettuSijoittelu } from '../types/sijoittelu-types';
import { getConfiguration } from '@/lib/configuration/client-configuration';
import { getConfigUrl } from '../configuration/configuration-utils';

export async function kaynnistaSijoittelu(hakuOid: string) {
  const configuration = getConfiguration();
  await client.post(
    getConfigUrl(configuration.routes.sijoittelu.kaynnistaSijoittelu, {
      hakuOid,
    }),
    {},
  );
}

export async function sijoittelunStatus(
  hakuOid: string,
): Promise<{ valmis: boolean; ohitettu: boolean; tekeillaan: boolean }> {
  const configuration = getConfiguration();
  const response = await client.get<{
    valmis: boolean;
    ohitettu: boolean;
    tekeillaan: boolean;
  }>(
    getConfigUrl(configuration.routes.sijoittelu.sijoittelunStatus, {
      hakuOid,
    }),
  );
  return response.data;
}

export async function getAjastettuSijoittelu(
  hakuOid: string,
): Promise<AjastettuSijoittelu | null> {
  const configuration = getConfiguration();
  const response = await client.get<{
    hakuOid: string;
    ajossa: boolean;
    aloitusajankohta: string;
    ajotiheys: number;
  } | null>(
    getConfigUrl(configuration.routes.sijoittelu.getAjastettuSijoittelu, {
      hakuOid,
    }),
  );
  if (isNullish(response?.data)) {
    return null;
  }
  return {
    active: response.data.ajossa,
    frequency: '' + response.data.ajotiheys,
    hakuOid: response.data.hakuOid,
    startTime: new Date(response.data.aloitusajankohta),
  };
}

export async function createAjastettuSijoittelu(
  hakuOid: string,
  startDate: Date,
  frequency: string,
) {
  const startTimeMillis = startDate.getTime();
  const configuration = getConfiguration();
  await client.post(configuration.routes.sijoittelu.createAjastettuSijoittelu, {
    hakuOid,
    aloitusajankohta: startTimeMillis,
    ajotiheys: frequency,
  });
}

export async function deleteAjastettuSijoittelu(hakuOid: string) {
  const configuration = getConfiguration();
  await client.get(
    getConfigUrl(configuration.routes.sijoittelu.deleteAjastettuSijoittelu, {
      hakuOid,
    }),
  );
}

export async function updateAjastettuSijoittelu(
  hakuOid: string,
  startDate: Date,
  frequency: string,
) {
  const configuration = getConfiguration();
  const updateUrl = new URL(
    configuration.routes.sijoittelu.updateAjastettuSijoittelu,
  );
  updateUrl.searchParams.append('hakuOid', hakuOid);
  updateUrl.searchParams.append('aloitusajankohta', '' + startDate.getTime());
  updateUrl.searchParams.append('ajotiheys', frequency);
  await client.get(updateUrl);
}
