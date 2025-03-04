import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KoeInputsStateless } from './koe-inputs';
import { ValintakoeInputTyyppi } from '@/app/lib/valintaperusteet/valintaperusteet-types';
import {
  ValintakoeOsallistuminenTulos,
  ValintakokeenPisteet,
} from '@/app/lib/types/laskenta-types';

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

const renderKoeInputs = ({
  osallistuminen,
  arvo,
}: {
  osallistuminen?: ValintakoeOsallistuminenTulos;
  arvo?: string;
} = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tFn: any = vi.fn().mockImplementation((x) => x);

  return render(
    <KoeInputsStateless
      hakemusOid={HAKEMUS_OID}
      arvo={arvo ?? KOE_PISTEET.arvo ?? ''}
      osallistuminen={osallistuminen ?? KOE_PISTEET.osallistuminen}
      koe={KOE}
      onChange={() => {}}
      disabled={false}
      t={tFn}
    />,
  );
};

const getOsallistuminenTranslation = (tulos: ValintakoeOsallistuminenTulos) =>
  `valintakoe.osallistumisenTila.${tulos}`;

describe('KoeInputsStateless', () => {
  test('Show both inputs when osallistuminen="OSALLISTUI"', () => {
    renderKoeInputs({
      osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
    });
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
    renderKoeInputs();

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
