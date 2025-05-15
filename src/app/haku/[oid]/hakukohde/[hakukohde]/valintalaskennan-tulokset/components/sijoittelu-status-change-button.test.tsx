import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SijoitteluStatusChangeButton } from './sijoittelu-status-change-button';
import { useSijoitteluStatusMutation } from '../hooks/useSijoitteluStatusMutation';
import { UserPermissions } from '@/lib/permissions';
import { OPH_ORGANIZATION_OID } from '@/lib/constants';
import { LaskennanValintatapajonoTulosWithHakijaInfo } from '@/hooks/useEditableValintalaskennanTulokset';

const ORG_OID = '1.2.3.4.5.6';
const ORG_OID2 = '6.5.4.3.2.1';

const renderSijoitteluButton = ({
  organisaatioOid,
  jono,
  statusMutation,
  permissions,
}: {
  organisaatioOid?: string;
  jono?: {
    valmisSijoiteltavaksi?: boolean;
    siirretaanSijoitteluun?: boolean;
  };
  permissions?: Partial<UserPermissions>;
  statusMutation?: {
    mutate?: (x: unknown) => void;
    isPending?: boolean;
  };
}) => {
  return render(
    <SijoitteluStatusChangeButton
      organisaatioOid={organisaatioOid ?? ORG_OID}
      jono={
        {
          valmisSijoiteltavaksi: true,
          siirretaanSijoitteluun: true,
          ...jono,
        } as LaskennanValintatapajonoTulosWithHakijaInfo
      }
      permissions={
        {
          writeOrganizations: [OPH_ORGANIZATION_OID],
          crudOrganizations: [OPH_ORGANIZATION_OID],
          ...permissions,
        } as UserPermissions
      }
      statusMutation={
        {
          mutate: vi.fn(),
          isPending: false,
          ...statusMutation,
        } as ReturnType<typeof useSijoitteluStatusMutation>
      }
    />,
  );
};

describe('SijoitteluStatusChangeButton', () => {
  test('Show "poista"-button when already in sijoittelu and call mutate with right args on click', () => {
    const mutateFn = vi.fn();
    const jono = {
      valmisSijoiteltavaksi: true,
      siirretaanSijoitteluun: true,
    };
    renderSijoitteluButton({ jono, statusMutation: { mutate: mutateFn } });

    const btn = screen.getByRole('button', {
      name: 'valintalaskennan-tulokset.poista-jono-sijoittelusta',
    });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(mutateFn).toBeCalledWith({ jono, jonoSijoitellaan: false });
  });
  test('Show "poista"-button when not valmis sijoiteltavaksi and call mutate with right args on click', () => {
    const mutateFn = vi.fn();
    const jono = {
      valmisSijoiteltavaksi: false,
      siirretaanSijoitteluun: true,
    };
    renderSijoitteluButton({ jono, statusMutation: { mutate: mutateFn } });

    const btn = screen.getByRole('button', {
      name: 'valintalaskennan-tulokset.siirra-jono-sijoitteluun',
    });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(mutateFn).toBeCalledWith({ jono, jonoSijoitellaan: true });
  });

  test('Disable button when permissions only to other ogranization', () => {
    renderSijoitteluButton({
      organisaatioOid: ORG_OID,
      permissions: {
        writeOrganizations: [ORG_OID2],
        crudOrganizations: [ORG_OID2],
      },
    });

    const btn = screen.getByRole('button', {
      name: 'valintalaskennan-tulokset.poista-jono-sijoittelusta',
    });
    expect(btn).toBeDisabled();
  });

  test('Disable "poista"-button even when has permimssions to organization (not OPH)"', () => {
    renderSijoitteluButton({
      organisaatioOid: ORG_OID,
      permissions: {
        writeOrganizations: [ORG_OID],
        crudOrganizations: [ORG_OID],
      },
    });

    const btn = screen.getByRole('button', {
      name: 'valintalaskennan-tulokset.poista-jono-sijoittelusta',
    });
    expect(btn).toBeDisabled();
  });

  test('Enable "Siirra"-button when user has permissions to organization"', () => {
    renderSijoitteluButton({
      jono: {
        valmisSijoiteltavaksi: false,
      },
      organisaatioOid: ORG_OID,
      permissions: {
        writeOrganizations: [ORG_OID],
        crudOrganizations: [ORG_OID],
      },
    });

    const btn = screen.getByRole('button', {
      name: 'valintalaskennan-tulokset.siirra-jono-sijoitteluun',
    });
    expect(btn).toBeEnabled();
  });

  test('Hide Sijoittelu-button when siirretaanSijoitteluun=false"', () => {
    renderSijoitteluButton({
      jono: {
        siirretaanSijoitteluun: false,
      },
    });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('Disable button when status operation pending"', () => {
    renderSijoitteluButton({
      statusMutation: {
        isPending: true,
      },
    });
    const btn = screen.getByRole('button', {
      name: 'valintalaskennan-tulokset.poista-jono-sijoittelusta',
    });
    expect(btn).toBeDisabled();
  });
});
