import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import {
  useCheckHakukohdePermission,
  useHakuPermissions,
} from './useHakuPermissions';
import {
  useHierarchyUserPermissions,
  useUserPermissions,
} from './useUserPermissions';
import {
  EMPTY_USER_PERMISSIONS,
  EMPTY_HAKUKOHDERYHMA_PERMISSIONS,
  expandUserPermissions,
  UserPermissions,
  HakuPermissions,
} from '@/lib/permissions';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { client } from '@/lib/http-client';
import { setConfiguration } from '@/lib/configuration/client-configuration';
import { buildConfiguration } from '@/lib/configuration/build-configuration';

vi.mock('./useUserPermissions', () => ({
  useUserPermissions: vi.fn(),
  useHierarchyUserPermissions: vi.fn(),
}));

afterEach(() => vi.restoreAllMocks());

const hakukohde = {
  oid: 'kohde',
  hakuOid: 'haku',
  tarjoajaOid: 'tarjoaja',
} as Hakukohde;
const ryhma = '1.2.246.562.28.123';
const toinenRyhma = '1.2.246.562.28.456';

const setPermissions = (permissions: Partial<UserPermissions>) => {
  const raw = { ...EMPTY_USER_PERMISSIONS, ...permissions };
  vi.mocked(useUserPermissions).mockReturnValue(raw);
  vi.mocked(useHierarchyUserPermissions).mockReturnValue(
    expandUserPermissions(raw, [{ oid: 'tarjoaja' }]),
  );
  setConfiguration(buildConfiguration());
};

const respondWithGroups = (groups: Record<string, Array<string>>) =>
  vi.spyOn(client, 'get').mockImplementation(async (url) => ({
    headers: new Headers(),
    data: [
      ...new Set(
        new URL(String(url)).searchParams
          .getAll('hakukohderyhmat')
          .flatMap((oid) => groups[oid] ?? []),
      ),
    ].map((oid) => ({
      ...hakukohde,
      oid,
      tarjoaja: hakukohde.tarjoajaOid,
      opetuskieliKoodiUrit: [],
    })),
  }));

const renderPermissions = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderHook(
    () => {
      const permissions = useHakuPermissions('haku');
      const read = useCheckHakukohdePermission(permissions, 'READ');
      const update = useCheckHakukohdePermission(permissions, 'READ_UPDATE');
      const crud = useCheckHakukohdePermission(permissions, 'CRUD');
      return {
        read,
        update,
        crud,
        current: {
          read: read(hakukohde),
          update: update(hakukohde),
          crud: crud(hakukohde),
        },
      };
    },
    {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>{children}</Suspense>
        </QueryClientProvider>
      ),
    },
  );
};

test('kaikki lukuryhmät haetaan yhdellä pyynnöllä, joka ei sisällä tarjoajarajausta', async () => {
  setPermissions({ readOrganizations: [ryhma, toinenRyhma] });
  const spy = respondWithGroups({
    [ryhma]: ['kohde'],
    [toinenRyhma]: ['toinen'],
  });
  const { result } = renderPermissions();
  await waitFor(() =>
    expect(result.current?.current).toEqual({
      read: true,
      update: false,
      crud: false,
    }),
  );
  expect(spy).toHaveBeenCalledTimes(1);
  const url = new URL(String(spy.mock.calls[0]?.[0]));
  expect(url.pathname).toBe('/kouta-internal/hakukohde/search');
  expect(url.searchParams.get('haku')).toBe('haku');
  expect(url.searchParams.getAll('hakukohderyhmat')).toEqual([
    ryhma,
    toinenRyhma,
  ]);
  expect(url.searchParams.has('tarjoaja')).toBe(false);
});

test('toisen ryhmän CRUD-oikeus ei korota hakukohteen lukuoikeutta', async () => {
  setPermissions({
    readOrganizations: [ryhma, toinenRyhma],
    writeOrganizations: [toinenRyhma],
    crudOrganizations: [toinenRyhma],
  });
  const spy = respondWithGroups({
    [ryhma]: ['kohde'],
    [toinenRyhma]: ['toinen'],
  });
  const { result } = renderPermissions();
  await waitFor(() =>
    expect(result.current?.current).toEqual({
      read: true,
      update: false,
      crud: false,
    }),
  );
  expect(spy).toHaveBeenCalledTimes(2);
  expect(result.current.read({ ...hakukohde, oid: 'toinen' })).toBe(true);
  expect(result.current.crud({ ...hakukohde, oid: 'toinen' })).toBe(true);
});

test('organisaatio-oikeuksilla ei tehdä ryhmäkohtaista hakua', async () => {
  setPermissions({
    readOrganizations: ['tarjoaja'],
    writeOrganizations: ['tarjoaja'],
  });
  const spy = vi.spyOn(client, 'get');
  const { result } = renderPermissions();
  await waitFor(() =>
    expect(result.current?.current).toEqual({
      read: true,
      update: true,
      crud: false,
    }),
  );
  expect(spy).not.toHaveBeenCalled();
});

test('samat ryhmät kaikilla oikeustasoilla tarvitsevat vain yhden pyynnön', async () => {
  setPermissions({
    readOrganizations: [ryhma],
    writeOrganizations: [ryhma],
    crudOrganizations: [ryhma],
  });
  const spy = respondWithGroups({ [ryhma]: ['kohde', 'toinen'] });
  const { result, rerender } = renderPermissions();
  await waitFor(() =>
    expect(result.current?.current).toEqual({
      read: true,
      update: true,
      crud: true,
    }),
  );
  expect(result.current.crud({ ...hakukohde, oid: 'toinen' })).toBe(true);
  expect(result.current.crud({ ...hakukohde, oid: 'ulkopuolinen' })).toBe(
    false,
  );
  expect(result.current.crud({ ...hakukohde, hakuOid: 'toinen-haku' })).toBe(
    false,
  );
  const check = result.current.crud;
  rerender();
  expect(result.current.crud).toBe(check);
  expect(spy).toHaveBeenCalledTimes(1);
});

test('kolme erilaista oikeustasoa tekee enintään kolme pyyntöä ryhmien määrästä riippumatta', async () => {
  const kolmasRyhma = '1.2.246.562.28.789';
  setPermissions({
    readOrganizations: [ryhma, toinenRyhma, kolmasRyhma],
    writeOrganizations: [toinenRyhma, kolmasRyhma],
    crudOrganizations: [kolmasRyhma],
  });
  const spy = respondWithGroups({
    [ryhma]: ['kohde'],
    [toinenRyhma]: ['muokattava'],
    [kolmasRyhma]: ['crud-kohde'],
  });
  const { result } = renderPermissions();
  await waitFor(() =>
    expect(result.current?.current).toEqual({
      read: true,
      update: false,
      crud: false,
    }),
  );
  expect(result.current.update({ ...hakukohde, oid: 'muokattava' })).toBe(true);
  expect(result.current.crud({ ...hakukohde, oid: 'muokattava' })).toBe(false);
  expect(result.current.crud({ ...hakukohde, oid: 'crud-kohde' })).toBe(true);
  expect(spy).toHaveBeenCalledTimes(3);
});

test('tarkistusfunktio käyttää annettuja oikeuksia ilman kyselyitä tai QueryClientProvideria', () => {
  const spy = vi.spyOn(client, 'get');
  const permissions: HakuPermissions = {
    hakuOid: 'haku',
    userPermissions: expandUserPermissions(EMPTY_USER_PERMISSIONS),
    hakukohderyhmaPermissions: {
      ...EMPTY_HAKUKOHDERYHMA_PERMISSIONS,
      READ_UPDATE: ['kohde'],
    },
  };
  const { result, rerender } = renderHook(
    ({ hakuPermissions }) =>
      useCheckHakukohdePermission(hakuPermissions, 'READ_UPDATE'),
    { initialProps: { hakuPermissions: permissions } },
  );
  expect(result.current(hakukohde)).toBe(true);
  expect(result.current({ ...hakukohde, oid: 'ulkopuolinen' })).toBe(false);
  rerender({
    hakuPermissions: {
      ...permissions,
      hakukohderyhmaPermissions: EMPTY_HAKUKOHDERYHMA_PERMISSIONS,
    },
  });
  expect(result.current(hakukohde)).toBe(false);
  expect(spy).not.toHaveBeenCalled();
});
