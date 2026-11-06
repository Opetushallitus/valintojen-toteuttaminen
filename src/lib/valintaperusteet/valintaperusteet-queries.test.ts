import { QueryClient } from '@tanstack/react-query';
import { afterEach, expect, test, vi } from 'vitest';
import { queryOptionsGetValintaryhmat } from './valintaperusteet-queries';
import { client } from '../http-client';
import { EMPTY_USER_PERMISSIONS, expandUserPermissions } from '../permissions';
import { setConfiguration } from '../configuration/client-configuration';
import { buildConfiguration } from '../configuration/build-configuration';

afterEach(() => vi.restoreAllMocks());

test('listauksen ja sisältönäkymän valintaryhmäkyselyt käyttävät samaa tulosta', async () => {
  setConfiguration(buildConfiguration());
  const spy = vi
    .spyOn(client, 'get')
    .mockResolvedValue({ headers: new Headers(), data: [] });
  const permissions = expandUserPermissions(EMPTY_USER_PERMISSIONS);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  });
  await queryClient.query(
    queryOptionsGetValintaryhmat('haku', permissions, ['kohde']),
  );
  await queryClient.query(
    queryOptionsGetValintaryhmat('haku', { ...permissions }, ['kohde']),
  );
  expect(spy).toHaveBeenCalledTimes(1);
  queryClient.clear();
});
