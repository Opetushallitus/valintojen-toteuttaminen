import { configuration } from '../configuration';
import { client } from '../http-client';

export async function kaynnistaSijoittelu(hakuOid: string) {
  await client.post(configuration.kaynnistaSijoittelu, { hakuOid });
}

export async function sijoittelunStatus(
  hakuOid: string,
): Promise<{ valmis: boolean; ohitettu: boolean }> {
  const response = await client.get<{ valmis: boolean; ohitettu: boolean }>(
    configuration.sijoittelunStatus({ hakuOid }),
  );
  console.log(response.data);
  return response.data;
}
