import { configuration } from '../configuration';
import { client } from '../http-client';

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
