import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EhdollisestiHyvaksyttavissaCheckbox } from './valinnan-tila-cell';
import { Haku, Tila } from '@/lib/kouta/kouta-types';

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

const renderEhdollinenCheckbox = ({
  kohdejoukko,
  organisaatioOid,
}: {
  organisaatioOid: string;
  kohdejoukko: string;
}) => {
  vi.mock('@/hooks/useUserPermissions', () => ({
    useHasOrganizationPermissions: (oid: string) => {
      return ORGS_WITH_UPDATE.includes(oid);
    },
  }));

  return render(
    <EhdollisestiHyvaksyttavissaCheckbox
      haku={{
        ...HAKU_BASE,
        organisaatioOid,
        kohdejoukkoKoodiUri: kohdejoukko,
      }}
      hakemus={{
        hakemusOid: 'mock-hakemus-oid',
        ehdollisestiHyvaksyttavissa: true,
      }}
      disabled={false}
      updateForm={mockUpdateForm}
    />,
  );
};

const getCheckbox = () =>
  screen.queryByRole('checkbox', { name: 'sijoittelun-tulokset.ehdollinen' });

describe('EhdollisestiHyvaksyttavissaCheckbox', () => {
  test('Show the checkbox when korkeakoulutus', () => {
    renderEhdollinenCheckbox({
      organisaatioOid: ORG_OID,
      kohdejoukko: 'haunkohdejoukko_12',
    });

    const checkbox = getCheckbox();
    expect(checkbox).toBeInTheDocument();
  });

  test('Hide the checkbox when not korkeakoulutus', () => {
    renderEhdollinenCheckbox({
      organisaatioOid: ORG_OID,
      kohdejoukko: 'haunkohdejoukko_01',
    });

    const checkbox = getCheckbox();

    expect(checkbox).not.toBeInTheDocument();
  });

  test('Enable when update permissions to haku organization', () => {
    renderEhdollinenCheckbox({
      organisaatioOid: ORG_OID,
      kohdejoukko: 'haunkohdejoukko_12',
    });

    const checkbox = getCheckbox();
    expect(checkbox).toBeEnabled();
  });

  test('Disable when no update permissions to haku organization', () => {
    renderEhdollinenCheckbox({
      organisaatioOid: 'oid-with-no-permissions',
      kohdejoukko: 'haunkohdejoukko_12',
    });

    const checkbox = getCheckbox();
    expect(checkbox).toBeDisabled();
  });
});
