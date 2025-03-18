import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createHakijaColumn, HakijaColumnLinkType } from './table-columns';

const HAKEMUS = {
  hakemusOid: '1.2.3',
  hakijanNimi: 'Hakija Kelpo',
  hakijaOid: '4.5.6',
} as const;

describe('createHakijaColumn', () => {
  test('creates link to application by defaukt', () => {
    render(createHakijaColumn({}).render(HAKEMUS));
    const rendered = screen.getByText('Hakija Kelpo');
    expect(rendered).not.toBeNull();
    expect(rendered.getAttribute('href')).toContain(
      'lomake-editori/applications/search?term=1.2.3',
    );
  });

  test('creates link to person', () => {
    render(
      createHakijaColumn({
        hakijaLinkType: HakijaColumnLinkType.HAKIJA,
      }).render(HAKEMUS),
    );
    const rendered = screen.getByText('Hakija Kelpo');
    expect(rendered).not.toBeNull();
    expect(rendered.getAttribute('href')).toContain('henkilo-ui/oppija/4.5.6');
  });
});
