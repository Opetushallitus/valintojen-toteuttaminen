import { Hakukohde } from '@/lib/kouta/kouta-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { useHenkiloPageData } from './useHenkiloPageData';
import {
  useHierarchyUserPermissions,
  useUserPermissions,
} from '@/hooks/useUserPermissions';
import {
  EMPTY_USER_PERMISSIONS,
  expandUserPermissions,
} from '@/lib/permissions';
import { queryOptionsGetHakukohteet } from '@/lib/kouta/kouta-queries';
import { client } from '@/lib/http-client';

vi.mock('@/hooks/useUserPermissions', () => ({
  useUserPermissions: vi.fn(),
  useHierarchyUserPermissions: vi.fn(),
}));

afterEach(() => vi.restoreAllMocks());

test.each([true, false])(
  'henkilönäkymän ryhmäkohtainen muokkausoikeus: %s',
  (canEdit) => {
    const group = '1.2.246.562.28.123';
    const permissions = {
      ...EMPTY_USER_PERMISSIONS,
      readOrganizations: [group],
      writeOrganizations: canEdit ? [group] : [],
    };
    vi.mocked(useUserPermissions).mockReturnValue(permissions);
    vi.mocked(useHierarchyUserPermissions).mockReturnValue(
      expandUserPermissions(permissions),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    });
    const hakukohteet = ['ryhman-kohde', 'ulkopuolinen'].map(
      (oid): Hakukohde => ({
        oid,
        hakuOid: 'haku',
        tarjoajaOid: 'toinen-yliopisto',
        nimi: { fi: oid },
        organisaatioOid: 'toinen-yliopisto',
        organisaatioNimi: { fi: 'Toinen yliopisto' },
        jarjestyspaikkaHierarkiaNimi: { fi: 'Toinen yliopisto' },
        voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
        opetuskielet: new Set(['fi']),
      }),
    );
    queryClient.setQueryData(
      ['getAtaruHakemukset', 'haku', 'hakemus'],
      [
        {
          oid: 'hakemus',
          personOid: 'hakija',
          etunimet: 'Testi',
          sukunimi: 'Hakija',
          asiointiKieli: { kieliKoodi: 'fi' },
          postinumero: '00100',
          hakutoiveet: hakukohteet.map((kohde) => ({
            hakukohdeOid: kohde.oid,
          })),
        },
      ],
    );
    queryClient.setQueryData(
      ['getHakemuksenValintalaskennanTulokset', 'haku', 'hakemus'],
      {},
    );
    queryClient.setQueryData(
      ['getLatestSijoitteluajonTuloksetForHakemus', 'haku', 'hakemus'],
      {},
    );
    queryClient.setQueryData(['getHakemuksenValinnanTulokset', 'hakemus'], {
      data: {},
      lastModified: '',
    });
    queryClient.setQueryData(['getAllHakukohteet', 'haku'], hakukohteet);
    queryClient.setQueryData(['getPostitoimipaikka', '00100'], {});
    queryClient.setQueryData(
      ['getPisteetForHakemus', 'hakemus', ['ryhman-kohde', 'ulkopuolinen']],
      { pisteet: {}, lastModified: '' },
    );
    queryClient.setQueryData(
      ['getValintakoeAvaimetHakukohteille', ['ryhman-kohde', 'ulkopuolinen']],
      {},
    );
    queryClient.setQueryData(
      queryOptionsGetHakukohteet('haku', {
        ...EMPTY_USER_PERMISSIONS,
        readOrganizations: [group],
      }).queryKey,
      hakukohteet.filter((kohde) => kohde.oid === 'ryhman-kohde'),
    );
    const spy = vi.spyOn(client, 'get');
    const { result } = renderHook(
      () => useHenkiloPageData({ hakuOid: 'haku', hakemusOid: 'hakemus' }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      },
    );
    expect(
      result.current.hakukohteet.map((kohde) => ({
        oid: kohde.oid,
        readOnly: kohde.readOnly,
      })),
    ).toEqual([
      { oid: 'ryhman-kohde', readOnly: !canEdit },
      { oid: 'ulkopuolinen', readOnly: true },
    ]);
    expect(spy).not.toHaveBeenCalled();
    queryClient.clear();
  },
);
