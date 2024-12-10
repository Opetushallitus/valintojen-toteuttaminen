import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KoeCellUncontrolled } from './koe-cell';
import { ValintakoeInputTyyppi } from '@/app/lib/types/valintaperusteet-types';
import {
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from '@/app/lib/types/laskenta-types';

vi.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => {
    return { t: (x: string) => x };
  },
}));

const HAKEMUS_OID = '1';

const KOE_PISTEET: ValintakokeenPisteet = {
  tunniste: 'tunniste',
  arvo: '10',
  osallistuminen: ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
  osallistuminenTunniste: 'tunniste-osallistuminen',
};

const KOE = {
  tunniste: 'tunniste',
  osallistuminenTunniste: 'tunniste-osallistuminen',
  kuvaus: 'koe',
  arvot: [],
  max: '100',
  min: '0',
  vaatiiOsallistumisen: false,
  inputTyyppi: ValintakoeInputTyyppi.INPUT,
};

const renderKoeCell = ({
  osallistuminen,
  arvo,
}: {
  osallistuminen?: ValintakoeOsallistuminenTulos;
  arvo?: string;
} = {}) => {
  return render(
    <KoeCellUncontrolled
      hakemusOid={HAKEMUS_OID}
      arvo={arvo ?? KOE_PISTEET.arvo ?? ''}
      osallistuminen={osallistuminen ?? KOE_PISTEET.osallistuminen}
      koe={KOE}
      onChange={() => {}}
      disabled={false}
    />,
  );
};

const getOsallistuminenTranslation = (tulos: ValintakoeOsallistuminenTulos) =>
  `valintakoe.osallistumisenTila.${tulos}`;

describe('KoeCell', () => {
  test('Show both inputs when osallistuminen="OSALLISTUI"', () => {
    renderKoeCell({ osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI });
    expect(
      screen.queryByRole('textbox', { name: 'pistesyotto.pisteet' }),
    ).toBeVisible();

    const osallistuminenSelect = screen.getByRole('combobox', {
      name: 'pistesyotto.osallistumisen-tila',
    });

    expect(osallistuminenSelect).toHaveTextContent(
      getOsallistuminenTranslation(ValintakoeOsallistuminenTulos.OSALLISTUI),
    );
  });

  test('Hide piste-input when osallistuminen="EI_OSALLISTUNUT"', () => {
    renderKoeCell();

    expect(
      screen.queryByRole('textbox', { name: 'pistesyotto.pisteet' }),
    ).not.toBeInTheDocument();

    const osallistuminenSelect = screen.getByRole('combobox', {
      name: 'pistesyotto.osallistumisen-tila',
    });

    expect(osallistuminenSelect).toHaveTextContent(
      getOsallistuminenTranslation(
        ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
      ),
    );
  });
});
