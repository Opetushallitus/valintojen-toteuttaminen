import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValinnanTilaCell } from './ValinnanTilaCell';
import { Haku, Tila } from '@/lib/kouta/kouta-types';
import { TranslatedName } from '@/lib/localization/localization-types';

const ORG_OID = '1.2.3.4.5';

const HAKU_BASE: Haku = {
  oid: '5.4.3.2.1',
  nimi: {
    fi: 'testihaku',
  },
  tila: Tila.JULKAISTU,
  alkamisVuosi: 2024,
  alkamisKausiKoodiUri: 'kausi_k#1',
  hakutapaKoodiUri: 'mock-hakutapa',
  hakukohteita: 123,
  kohdejoukkoKoodiUri: 'mock-kohdejoukko',
  organisaatioOid: ORG_OID,
};

const ORGS_WITH_UPDATE = [ORG_OID];

const mockUpdateForm = vi.fn();

const renderValinnanTilaCell = ({
  organisaatioOid,
  kohdejoukko,
}: {
  organisaatioOid: string;
  kohdejoukko: string;
}) => {
  vi.mock('@/hooks/useUserPermissions', () => ({
    useHasSomeOrganizationPermission: (oid: string) => {
      return ORGS_WITH_UPDATE.includes(oid);
    },
  }));

  vi.mock('@/lib/koodisto/useHyvaksynnanEhdot', () => ({
    useHyvaksynnanEhdot: () => {
      return {
        data: [
          {
            koodiUri: 'hyvaksynnanehto_muu#1',
            nimi: { fi: 'muu fi' },
            koodiArvo: 'muu',
          },
          {
            koodiUri: 'hyvaksynnanehto_sora#1',
            nimi: { fi: 'sora fi' },
            koodiArvo: 'sora',
          },
          {
            koodiUri: 'hyvaksynnanehto_ltt#1',
            nimi: { fi: 'ltt fi' },
            koodiArvo: 'ltt',
          },
        ],
      };
    },
  }));

  return render(
    <ValinnanTilaCell
      haku={{
        ...HAKU_BASE,
        organisaatioOid,
        kohdejoukkoKoodiUri: kohdejoukko,
      }}
      hakemus={{
        hakijanNimi: 'Testi Hakija',
        hakijaOid: 'mock-hakija-oid',
        hakemusOid: 'mock-hakemus-oid',
        ehdollisestiHyvaksyttavissa: true,
      }}
      disabled={false}
      updateForm={mockUpdateForm}
      mode="valinta"
      t={(x) => x as string}
      translateEntity={(x: TranslatedName) => x.fi ?? ''}
    />,
  );
};

const getEhdollinenCheckbox = () =>
  screen.queryByRole('checkbox', { name: 'sijoittelun-tulokset.ehdollinen' });

describe('Ehdollisesti hyväksyttävissä checkbox', () => {
  test('Show when korkeakoulutus', () => {
    renderValinnanTilaCell({
      organisaatioOid: ORG_OID,
      kohdejoukko: 'haunkohdejoukko_12',
    });

    const checkbox = getEhdollinenCheckbox();
    expect(checkbox).toBeInTheDocument();
  });

  test('Hide when not korkeakoulutus', () => {
    renderValinnanTilaCell({
      organisaatioOid: ORG_OID,
      kohdejoukko: 'haunkohdejoukko_01',
    });

    const checkbox = getEhdollinenCheckbox();

    expect(checkbox).not.toBeInTheDocument();
  });

  test('Enable when update permissions to haku organization', () => {
    renderValinnanTilaCell({
      organisaatioOid: ORG_OID,
      kohdejoukko: 'haunkohdejoukko_12',
    });

    const checkbox = getEhdollinenCheckbox();
    expect(checkbox).toBeEnabled();
  });

  test('Disable when no update permissions to haku organization', () => {
    renderValinnanTilaCell({
      organisaatioOid: 'oid-with-no-permissions',
      kohdejoukko: 'haunkohdejoukko_12',
    });

    const checkbox = getEhdollinenCheckbox();
    expect(checkbox).toBeDisabled();
  });
});
