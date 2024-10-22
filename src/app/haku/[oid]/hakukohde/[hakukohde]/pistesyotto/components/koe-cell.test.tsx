import { describe, expect, test, vi } from 'vitest';
import {
  queryByAttribute,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { KoeCell } from './koe-cell';
import { ValintakoeInputTyyppi } from '@/app/lib/types/valintaperusteet-types';
import { ValintakoeOsallistuminenTulos } from '@/app/lib/types/laskenta-types';
import userEvent from '@testing-library/user-event';

vi.mock('@/app/hooks/useTranslations', () => ({
  useTranslations: () => {
    return { t: (x: string) => x };
  },
}));

const PISTETIEDOT = {
  hakemusOid: '1',
  hakijanNimi: 'Nukettaja Ruhtinas',
  etunimet: 'Nukettaja',
  sukunimi: 'Ruhtinas',
  hakijaOid: '2',
  valintakokeenPisteet: [
    {
      tunniste: 'tunniste',
      arvo: '10',
      osallistuminen: ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
      osallistuminenTunniste: 'tunniste-osallistuminen',
    },
  ],
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
  const updateFormFn = vi.fn();
  return render(
    <KoeCell
      pisteTiedot={Object.assign({}, PISTETIEDOT, {
        valintakokeenPisteet: PISTETIEDOT.valintakokeenPisteet.map(
          (pisteet) => ({
            ...pisteet,
            arvo,
            osallistuminen:
              osallistuminen ?? ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
          }),
        ),
      })}
      koe={KOE}
      updateForm={updateFormFn}
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
      screen.queryByRole('textbox', { name: 'validaatio.numero.syota' }),
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
      screen.queryByRole('textbox', { name: 'validaatio.numero.syota' }),
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

  test('Change osallistuminen from "MERKITSEMATTA" to "OSALLISTUI", when changing pisteet', async () => {
    renderKoeCell({
      osallistuminen: ValintakoeOsallistuminenTulos.MERKITSEMATTA,
      arvo: '',
    });

    const pisteetInput = screen.getByRole('textbox', {
      name: 'validaatio.numero.syota',
    });

    expect(pisteetInput).toHaveValue('');

    const osallistuminenSelect = screen.getByRole('combobox', {
      name: 'pistesyotto.osallistumisen-tila',
    });

    expect(osallistuminenSelect).toHaveTextContent(
      getOsallistuminenTranslation(ValintakoeOsallistuminenTulos.MERKITSEMATTA),
    );

    await userEvent.type(pisteetInput, '10');

    expect(osallistuminenSelect).toHaveTextContent(
      getOsallistuminenTranslation(ValintakoeOsallistuminenTulos.OSALLISTUI),
    );
  });

  test.each([
    ValintakoeOsallistuminenTulos.EI_OSALLISTUNUT,
    ValintakoeOsallistuminenTulos.MERKITSEMATTA,
    ValintakoeOsallistuminenTulos.EI_VAADITA,
  ])(
    'Clear pisteet, when changing osallistuminen from "%s" to "OSALLISTUI"',
    async (newOsallistuminen: ValintakoeOsallistuminenTulos) => {
      const result = renderKoeCell({
        osallistuminen: ValintakoeOsallistuminenTulos.OSALLISTUI,
        arvo: '10',
      });

      let pisteetInput = screen.getByRole('textbox', {
        name: 'validaatio.numero.syota',
      });

      expect(pisteetInput).toHaveValue('10');

      const osallistuminenSelect = screen.getByRole('combobox', {
        name: 'pistesyotto.osallistumisen-tila',
      });

      const listboxId = osallistuminenSelect.getAttribute('aria-controls')!;
      await userEvent.click(osallistuminenSelect);

      let listbox = within(
        queryByAttribute('id', result.baseElement, listboxId)!,
      );

      await userEvent.click(
        listbox.getByText(getOsallistuminenTranslation(newOsallistuminen)),
      );

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });

      await userEvent.click(osallistuminenSelect);

      listbox = within(queryByAttribute('id', result.baseElement, listboxId)!);

      await userEvent.click(
        listbox.getByText(
          getOsallistuminenTranslation(
            ValintakoeOsallistuminenTulos.OSALLISTUI,
          ),
        ),
      );

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });

      pisteetInput = screen.getByRole('textbox', {
        name: 'validaatio.numero.syota',
      });

      expect(pisteetInput).toHaveValue('');
    },
  );
});
