import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValinnanTilaCell } from './ValinnanTilaCell';
import { Haku, Hakukohde, Tila } from '@/lib/kouta/kouta-types';
import { TranslatedName } from '@/lib/localization/localization-types';
import { ValinnanTila } from '@/lib/types/sijoittelu-types';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';

const HAKUKOHDE_ORG_OID = '1.2.3.4.5';
const TARJOAJA_OID = 'tarjoaja-oid';

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
  organisaatioOid: 'haku-org-oid',
};

const HAKUKOHDE_BASE: Hakukohde = {
  oid: 'mock-hakukohde-oid',
  hakuOid: HAKU_BASE.oid,
  nimi: { fi: 'mock hakukohde' },
  organisaatioOid: HAKUKOHDE_ORG_OID,
  organisaatioNimi: { fi: 'mock organisaatio' },
  jarjestyspaikkaHierarkiaNimi: { fi: 'mock jarjestyspaikka' },
  tarjoajaOid: TARJOAJA_OID,
  voikoHakukohteessaOllaHarkinnanvaraisestiHakeneita: false,
  opetuskielet: new Set(['fi']),
};

const ORGS_WITH_UPDATE = [TARJOAJA_OID];

const mockUpdateForm = vi.fn();

const renderValinnanTilaCell = ({
  tarjoajaOid,
  kohdejoukko,
  mode = 'valinta',
  hakemus,
}: {
  tarjoajaOid: string;
  kohdejoukko: string;
  mode?: 'valinta' | 'sijoittelu';
  hakemus?: Partial<HakemuksenValinnanTulos>;
}) => {
  vi.mock('@/hooks/useUserPermissions', () => ({
    useCheckPermission: () => {
      return (oid: string) => ORGS_WITH_UPDATE.includes(oid);
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
        kohdejoukkoKoodiUri: kohdejoukko,
      }}
      hakukohde={{
        ...HAKUKOHDE_BASE,
        tarjoajaOid,
      }}
      hakemus={{
        hakijanNimi: 'Testi Hakija',
        hakijaOid: 'mock-hakija-oid',
        hakemusOid: 'mock-hakemus-oid',
        ehdollisestiHyvaksyttavissa: true,
        ...hakemus,
      }}
      disabled={false}
      updateForm={mockUpdateForm}
      mode={mode}
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
      tarjoajaOid: TARJOAJA_OID,
      kohdejoukko: 'haunkohdejoukko_12',
    });

    const checkbox = getEhdollinenCheckbox();
    expect(checkbox).toBeInTheDocument();
  });

  test('Hide when not korkeakoulutus', () => {
    renderValinnanTilaCell({
      tarjoajaOid: TARJOAJA_OID,
      kohdejoukko: 'haunkohdejoukko_01',
    });

    const checkbox = getEhdollinenCheckbox();

    expect(checkbox).not.toBeInTheDocument();
  });

  test('Enable when update permissions to hakukohde tarjoaja organization', () => {
    renderValinnanTilaCell({
      tarjoajaOid: TARJOAJA_OID,
      kohdejoukko: 'haunkohdejoukko_12',
    });

    const checkbox = getEhdollinenCheckbox();
    expect(checkbox).toBeEnabled();
  });

  test('Disable when no update permissions to hakukohde tarjoaja organization', () => {
    renderValinnanTilaCell({
      tarjoajaOid: HAKUKOHDE_ORG_OID,
      kohdejoukko: 'haunkohdejoukko_12',
    });

    const checkbox = getEhdollinenCheckbox();
    expect(checkbox).toBeDisabled();
  });
});

const getHyvaksymiskirjeCheckbox = () =>
  screen.queryByRole('checkbox', {
    name: 'sijoittelun-tulokset.hyvaksymiskirje-lahetetty',
  });

describe('Hyväksymiskirje lähetetty checkbox', () => {
  test('Show in sijoittelu mode when valinnanTila is HYVAKSYTTY', () => {
    renderValinnanTilaCell({
      tarjoajaOid: TARJOAJA_OID,
      kohdejoukko: 'haunkohdejoukko_12',
      mode: 'sijoittelu',
      hakemus: { valinnanTila: ValinnanTila.HYVAKSYTTY },
    });

    expect(getHyvaksymiskirjeCheckbox()).toBeInTheDocument();
  });

  test('Show in sijoittelu mode when valinnanTila is VARASIJALTA_HYVAKSYTTY', () => {
    renderValinnanTilaCell({
      tarjoajaOid: TARJOAJA_OID,
      kohdejoukko: 'haunkohdejoukko_12',
      mode: 'sijoittelu',
      hakemus: { valinnanTila: ValinnanTila.VARASIJALTA_HYVAKSYTTY },
    });

    expect(getHyvaksymiskirjeCheckbox()).toBeInTheDocument();
  });

  test('Hide in sijoittelu mode for other valinnanTila values', () => {
    renderValinnanTilaCell({
      tarjoajaOid: TARJOAJA_OID,
      kohdejoukko: 'haunkohdejoukko_12',
      mode: 'sijoittelu',
      hakemus: { valinnanTila: ValinnanTila.VARALLA },
    });

    expect(getHyvaksymiskirjeCheckbox()).not.toBeInTheDocument();
  });

  test('Show in valinta mode too when valinnanTila is HYVAKSYTTY', () => {
    renderValinnanTilaCell({
      tarjoajaOid: TARJOAJA_OID,
      kohdejoukko: 'haunkohdejoukko_12',
      mode: 'valinta',
      hakemus: { valinnanTila: ValinnanTila.HYVAKSYTTY },
    });

    expect(getHyvaksymiskirjeCheckbox()).toBeInTheDocument();
  });

  test('Reflects hakemus.hyvaksymiskirjeLahetetty checked state', () => {
    renderValinnanTilaCell({
      tarjoajaOid: TARJOAJA_OID,
      kohdejoukko: 'haunkohdejoukko_12',
      mode: 'sijoittelu',
      hakemus: {
        valinnanTila: ValinnanTila.HYVAKSYTTY,
        hyvaksymiskirjeLahetetty: true,
      },
    });

    expect(getHyvaksymiskirjeCheckbox()).toBeChecked();
  });

  test('Is enabled regardless of update permissions to hakukohde tarjoaja organization', () => {
    renderValinnanTilaCell({
      tarjoajaOid: HAKUKOHDE_ORG_OID,
      kohdejoukko: 'haunkohdejoukko_12',
      mode: 'sijoittelu',
      hakemus: { valinnanTila: ValinnanTila.HYVAKSYTTY },
    });

    expect(getHyvaksymiskirjeCheckbox()).toBeEnabled();
  });
});
