import { render, screen } from '@testing-library/react';
import { vi, describe, expect } from 'vitest';
import { SearchInput } from './search-input';
import { test } from 'vitest';
import { act } from 'react';

describe('SearchInput', () => {
  test('should maintain focus when searchPhrase changes', async () => {
    const mockSetSearchPhrase = vi.fn();

    const { rerender } = render(
      <SearchInput searchPhrase="" setSearchPhrase={mockSetSearchPhrase} />,
    );

    const input = screen.getByRole('textbox');
    act(() => {
      input.focus();
    });
    expect(input).toHaveFocus();

    rerender(
      <SearchInput searchPhrase="test" setSearchPhrase={mockSetSearchPhrase} />,
    );

    // Input should still be focused
    expect(input).toHaveFocus();
  });
});
