import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { useCheckHakukohdePermission } from './useHakukohdePermissions';
import { useUserPermissions } from './useUserPermissions';
import { EMPTY_USER_PERMISSIONS, UserPermissions } from '@/lib/permissions';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { client } from '@/lib/http-client';
import { setConfiguration } from '@/lib/configuration/client-configuration';
import { buildConfiguration } from '@/lib/configuration/build-configuration';

vi.mock('./useUserPermissions', () => ({
  useUserPermissions: vi.fn(),
  useHierarchyUserPermissions: (permissions: UserPermissions) => permissions,
}));

afterEach(() => vi.restoreAllMocks());

const hakukohde = {
  oid: 'hakukohde',
  hakuOid: 'haku',
  tarjoajaOid: 'tarjoaja',
} as Hakukohde;
const ryhma = '1.2.246.562.28.123';
const hakukohdeResponse = {
  ...hakukohde,
  tarjoaja: hakukohde.tarjoajaOid,
  opetuskieliKoodiUrit: [],
};

const renderPermissions = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderHook(
    () => ({
      read: useCheckHakukohdePermission(hakukohde, 'READ'),
      update: useCheckHakukohdePermission(hakukohde, 'READ_UPDATE'),
      crud: useCheckHakukohdePermission(hakukohde, 'CRUD'),
    }),
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>{children}</Suspense>
        </QueryClientProvider>
      ),
    },
  );
};

test('lukuryhmän jäsenyys ei anna muokkausoikeutta eikä CRUD-oikeutta', async () => {
  setConfiguration(buildConfiguration());
  vi.mocked(useUserPermissions).mockReturnValue({
    ...EMPTY_USER_PERMISSIONS,
    readOrganizations: [ryhma],
  });
  const spy = vi.spyOn(client, 'get').mockResolvedValue({
    headers: new Headers(),
    data: [hakukohdeResponse],
  });
  const { result } = renderPermissions();
  await waitFor(() =>
    expect(result.current).toEqual({ read: true, update: false, crud: false }),
  );
  expect(spy).toHaveBeenCalledTimes(1);
  const url = new URL(String(spy.mock.calls[0]?.[0]));
  expect(url.pathname).toBe('/kouta-internal/hakukohde/search');
  expect(url.searchParams.get('haku')).toBe('haku');
  expect(url.searchParams.getAll('hakukohderyhmat')).toEqual([ryhma]);
  expect(url.searchParams.has('tarjoaja')).toBe(false);
});

test('toisen ryhmän oikeudet eivät salli hakukohteen avaamista tai muokkausta', async () => {
  setConfiguration(buildConfiguration());
  vi.mocked(useUserPermissions).mockReturnValue({
    ...EMPTY_USER_PERMISSIONS,
    readOrganizations: [ryhma],
    writeOrganizations: [ryhma],
    crudOrganizations: [ryhma],
  });
  vi.spyOn(client, 'get').mockResolvedValue({
    headers: new Headers(),
    data: [{ ...hakukohdeResponse, oid: 'toinen-hakukohde' }],
  });
  const { result } = renderPermissions();
  await waitFor(() =>
    expect(result.current).toEqual({ read: false, update: false, crud: false }),
  );
});

test('organisaatio-oikeuksilla ei tehdä ryhmäkohtaista hakua', async () => {
  vi.mocked(useUserPermissions).mockReturnValue({
    ...EMPTY_USER_PERMISSIONS,
    readOrganizations: ['tarjoaja'],
    writeOrganizations: ['tarjoaja'],
  });
  const spy = vi.spyOn(client, 'get');
  const { result } = renderPermissions();
  await waitFor(() =>
    expect(result.current).toEqual({ read: true, update: true, crud: false }),
  );
  expect(spy).not.toHaveBeenCalled();
});

test('hakukohteen ryhmän CRUD-oikeus sallii kaikki oikeustasot', async () => {
  setConfiguration(buildConfiguration());
  vi.mocked(useUserPermissions).mockReturnValue({
    ...EMPTY_USER_PERMISSIONS,
    readOrganizations: [ryhma],
    writeOrganizations: [ryhma],
    crudOrganizations: [ryhma],
  });
  vi.spyOn(client, 'get').mockResolvedValue({
    headers: new Headers(),
    data: [hakukohdeResponse],
  });
  const { result } = renderPermissions();
  await waitFor(() =>
    expect(result.current).toEqual({ read: true, update: true, crud: true }),
  );
});

test('toisen ryhmän CRUD-oikeus ei korota hakukohteen lukuryhmän oikeuksia', async () => {
  setConfiguration(buildConfiguration());
  const crudRyhma = '1.2.246.562.28.456';
  vi.mocked(useUserPermissions).mockReturnValue({
    ...EMPTY_USER_PERMISSIONS,
    readOrganizations: [ryhma, crudRyhma],
    writeOrganizations: [crudRyhma],
    crudOrganizations: [crudRyhma],
  });
  vi.spyOn(client, 'get').mockImplementation(async (url) => ({
    headers: new Headers(),
    data:
      new URL(String(url)).searchParams.get('hakukohderyhmat') === ryhma
        ? [hakukohdeResponse]
        : [{ ...hakukohdeResponse, oid: 'toinen-hakukohde' }],
  }));
  const { result } = renderPermissions();
  await waitFor(() =>
    expect(result.current).toEqual({ read: true, update: false, crud: false }),
  );
});

test('saman haun ryhmähaku jaetaan eri hakukohteiden kesken', async () => {
  setConfiguration(buildConfiguration());
  vi.mocked(useUserPermissions).mockReturnValue({
    ...EMPTY_USER_PERMISSIONS,
    readOrganizations: [ryhma],
  });
  const toinen = { ...hakukohde, oid: 'toinen-hakukohde' };
  const spy = vi.spyOn(client, 'get').mockResolvedValue({
    headers: new Headers(),
    data: [hakukohdeResponse, { ...hakukohdeResponse, oid: toinen.oid }],
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const { result } = renderHook(
    () => ({
      first: useCheckHakukohdePermission(hakukohde, 'READ'),
      second: useCheckHakukohdePermission(toinen, 'READ'),
    }),
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>{children}</Suspense>
        </QueryClientProvider>
      ),
    },
  );
  await waitFor(() =>
    expect(result.current).toEqual({ first: true, second: true }),
  );
  expect(spy).toHaveBeenCalledTimes(1);
});
