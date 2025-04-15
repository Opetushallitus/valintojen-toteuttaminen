import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HistoryEvent } from './change-history-global-modal';

describe('HistoryEvent', () => {
  it('renders tila change correctly', () => {
    const TILA_CHANGES = [
      {
        field: 'valinnantila',
        from: 'HYVAKSYTTY',
        to: 'HYLATTY',
      },
      {
        field: 'julkaistavissa',
        from: true,
        to: false,
      },
    ];
    const { container } = render(<HistoryEvent changes={TILA_CHANGES} />);
    expect(container).toHaveTextContent(
      'sijoittelun-tulokset.muutoshistoria.muutokset.valinnantila: sijoittelun-tulokset.muutoshistoria.muutokset.HYLATTY' +
        'sijoittelun-tulokset.muutoshistoria.muutokset.julkaistavissa: yleinen.ei',
    );
  });
  it('renders email change correctly', () => {
    const EMAIL_CHANGES = [
      {
        field: 'Sähköpostilähetyksen syy',
        to: 'VASTAANOTTOILMOITUS',
      },
      {
        field: 'Sähköposti merkitty lähetettäväksi',
        to: '2025-04-11T16:02:01.109059+03:00',
      },
      {
        field: 'Sähköposti lähetetty',
        to: '',
      },
    ];
    const { container } = render(<HistoryEvent changes={EMAIL_CHANGES} />);
    expect(container).toHaveTextContent(
      'Sähköpostilähetyksen syy: sijoittelun-tulokset.muutoshistoria.muutokset.VASTAANOTTOILMOITUS' +
        'Sähköposti merkitty lähetettäväksi: 11.4.2025 16:02:01' +
        'Sähköposti lähetetty:',
    );
  });
});
