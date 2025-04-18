import { isNullish } from 'remeda';
import { configuration } from '../configuration';
import { client } from '../http-client';
import { AjastettuSijoittelu } from '../types/sijoittelu-types';

export async function kaynnistaSijoittelu(hakuOid: string) {
  await client.post(configuration.kaynnistaSijoittelu({ hakuOid }), {});
}

export async function sijoittelunStatus(
  hakuOid: string,
): Promise<{ valmis: boolean; ohitettu: boolean; tekeillaan: boolean }> {
  const response = await client.get<{
    valmis: boolean;
    ohitettu: boolean;
    tekeillaan: boolean;
  }>(configuration.sijoittelunStatus({ hakuOid }));
  return response.data;
}

export async function getAjastettuSijoittelu(
  hakuOid: string,
): Promise<AjastettuSijoittelu | null> {
  const response = await client.get<{
    hakuOid: string;
    ajossa: boolean;
    aloitusajankohta: string;
    ajotiheys: number;
  } | null>(configuration.getAjastettuSijoittelu({ hakuOid }));
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
  await client.post(configuration.createAjastettuSijoittelu, {
    hakuOid,
    aloitusajankohta: startTimeMillis,
    ajotiheys: frequency,
  });
}

export async function deleteAjastettuSijoittelu(hakuOid: string) {
  await client.get(configuration.deleteAjastettuSijoittelu({ hakuOid }));
}

export async function updateAjastettuSijoittelu(
  hakuOid: string,
  startDate: Date,
  frequency: string,
) {
  const updateUrl = new URL(configuration.updateAjastettuSijoittelu);
  updateUrl.searchParams.append('hakuOid', hakuOid);
  updateUrl.searchParams.append('aloitusajankohta', '' + startDate.getTime());
  updateUrl.searchParams.append('ajotiheys', frequency);
  await client.get(updateUrl);
}
