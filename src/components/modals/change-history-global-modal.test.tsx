import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HistoryEvent } from './change-history-global-modal';
import { Haku, Tila } from '@/lib/kouta/kouta-types';
import { VastaanottoTila } from '@/lib/types/sijoittelu-types';

const TOISEN_ASTEEN_YHTEISHAKU: Haku = {
  oid: 'haku-oid',
  nimi: { fi: 'Haku' },
  tila: Tila.JULKAISTU,
  hakutapaKoodiUri: 'hakutapa_01',
  hakukohteita: 1,
  kohdejoukkoKoodiUri: 'haunkohdejoukko_11#1',
  organisaatioOid: 'organisaatio-oid',
};

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
  it('renders toisen asteen vastaanottanut without sitovasti suffix', () => {
    const VASTAANOTTOTILA_CHANGES = [
      {
        field: 'vastaanottotila',
        to: VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
      },
    ];
    const { container } = render(
      <HistoryEvent
        changes={VASTAANOTTOTILA_CHANGES}
        haku={TOISEN_ASTEEN_YHTEISHAKU}
      />,
    );
    expect(container).toHaveTextContent(
      'sijoittelun-tulokset.muutoshistoria.muutokset.vastaanottotila: vastaanottotila.VASTAANOTTANUT',
    );
  });
});
