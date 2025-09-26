import { getConfiguration } from '../configuration/client-configuration';
import { client } from '../http-client';
import { PersonDetails } from './onr-types';

export async function getUsersDetails(personOids: Array<string>) {
  console.log('personOids', personOids);

  const configuration = getConfiguration();

  const res = await client.post<Array<PersonDetails>>(
    configuration.routes.yleiset.usersDetails,
    personOids,
  );

  return res.data;
}
